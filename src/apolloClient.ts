import {
    ApolloClient,
    ApolloLink,
    from,
    HttpLink,
    InMemoryCache,
    split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition, Observable } from "@apollo/client/utilities";
import * as Sentry from "@sentry/react";
import type { GraphQLFormattedError } from "graphql";
import { Client, createClient } from "graphql-ws";
import { getCurrentCampaignId } from "./contexts/Campaign.context";
import { showToast } from "./contexts/Toaster.context";
import { forceTokenRefresh } from "./services/tokenRefresh";

// Environment variables
const apiUrl = import.meta.env.VITE_API_URL; // HTTP endpoint
const wsUrl = import.meta.env.VITE_WS_URL; // WebSocket endpoint

// Store token dynamically
let authToken: string | null = null;

// Store WebSocket client for reconnection
let wsClient: Client | null = null;

// Flag to trigger token refresh on next WebSocket reconnection
let shouldRefreshTokenOnReconnect = false;

export const setAuthToken = (token: string | null) => {
    authToken = token;
    if (token) {
        tokenSetResolvers.forEach((resolve) => resolve());
        tokenSetResolvers = [];
    }
};

let tokenSetResolvers: (() => void)[] = [];

// Method which will check for the Auth Token and wait for it to be set before making GraphQL requests
const waitForTokenLink = new ApolloLink((operation, forward) => {
    if (authToken) {
        return forward(operation);
    } else {
        return new Observable((observer) => {
            tokenSetResolvers.push(() => {
                forward(operation).subscribe({
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                });
            });
        });
    }
});

// HTTP link for queries and mutations
const httpLink = new HttpLink({
    uri: apiUrl,
});

// Middleware to attach the Authorization and Campaign headers
const authLink = setContext((_, { headers }) => {
    const campaignId = getCurrentCampaignId();
    return {
        headers: {
            ...headers,
            Authorization: authToken ? `Bearer ${authToken}` : null,
            "x-selected-campaign-id": campaignId || null,
        },
    };
});

// Helper to detect auth errors from GraphQL Shield's "Not Authorised!" response
function isAuthError(
    graphQLErrors?: readonly GraphQLFormattedError[]
): boolean {
    if (!graphQLErrors) return false;
    return graphQLErrors.some(
        (err) =>
            err.message
                .toLowerCase()
                .includes("please provide a valid token") ||
            err.extensions?.code === "UNAUTHENTICATED"
    );
}

// Error link for handling auth errors and retrying operations
const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
        const hasAuthError = isAuthError(graphQLErrors);

        // Check for network 401 errors
        const isNetworkAuthError =
            networkError &&
            "statusCode" in networkError &&
            networkError.statusCode === 401;

        // Capture GraphQL errors to Sentry (excluding auth errors)
        if (graphQLErrors && !hasAuthError) {
            graphQLErrors.forEach((error) => {
                Sentry.captureException(error, {
                    tags: {
                        type: "graphql",
                        operation: operation.operationName,
                    },
                    extra: {
                        query: operation.query.loc?.source.body,
                        variables: operation.variables,
                    },
                });
            });
        }

        // Capture network errors to Sentry (excluding auth errors)
        if (networkError && !isNetworkAuthError) {
            Sentry.captureException(networkError, {
                tags: {
                    type: "network",
                    operation: operation.operationName,
                },
                extra: {
                    variables: operation.variables,
                },
            });
        }

        if (hasAuthError || isNetworkAuthError) {
            return new Observable((observer) => {
                forceTokenRefresh()
                    .then(() => {
                        // Retry the operation
                        forward(operation).subscribe({
                            next: observer.next.bind(observer),
                            error: observer.error.bind(observer),
                            complete: observer.complete.bind(observer),
                        });
                    })
                    .catch((refreshError) => {
                        // Token refresh failed, emit original error
                        console.error("Token refresh failed:", refreshError);

                        // Show user-friendly error toast
                        showToast.danger({
                            title: "Authentication Error",
                            message:
                                "Your session has expired. Please log in again.",
                            duration: 8000,
                            closable: true,
                        });

                        if (graphQLErrors) {
                            observer.error({ graphQLErrors });
                        } else if (networkError) {
                            observer.error(networkError);
                        }
                    });
            });
        }
    }
);

// Create WebSocket client with lazy connectionParams for token refresh
function createWsClient(): Client {
    return createClient({
        url: wsUrl,
        connectionParams: async () => {
            // If flagged, refresh token before connecting
            if (shouldRefreshTokenOnReconnect) {
                try {
                    await forceTokenRefresh();
                    shouldRefreshTokenOnReconnect = false;
                } catch (e) {
                    console.error(
                        "Failed to refresh token for WS reconnect:",
                        e
                    );
                    showToast.danger({
                        title: "Connection Error",
                        message:
                            "Unable to re-authenticate WebSocket connection. Please refresh the page.",
                        duration: 10000,
                        closable: true,
                    });
                }
            }

            const campaignId = getCurrentCampaignId();
            return {
                headers: {
                    Authorization: authToken ? `Bearer ${authToken}` : null,
                    "x-selected-campaign-id": campaignId || null,
                },
                "x-selected-campaign-id": campaignId || null,
                Authorization: authToken ? `Bearer ${authToken}` : null,
            };
        },
        retryAttempts: 5,
        shouldRetry: (errOrCloseEvent) => {
            // Check for auth-related close codes
            if (
                errOrCloseEvent &&
                typeof errOrCloseEvent === "object" &&
                "code" in errOrCloseEvent
            ) {
                const code = (errOrCloseEvent as CloseEvent).code;
                // 4401/4403 are common auth failure codes, 3000 is Forbidden
                if (code === 4401 || code === 4403 || code === 3000) {
                    shouldRefreshTokenOnReconnect = true;
                    return true;
                }
            }
            return true;
        },
        on: {
            closed: (event) => {
                const closeEvent = event as CloseEvent;
                if (
                    closeEvent.code === 4401 ||
                    closeEvent.code === 4403 ||
                    closeEvent.code === 3000
                ) {
                    console.warn(
                        "WebSocket closed due to auth error, will refresh token on reconnect"
                    );
                    shouldRefreshTokenOnReconnect = true;
                }
            },
        },
    });
}

// Initialize WebSocket client
wsClient = createWsClient();

// WebSocket link for subscriptions
let wsLink = new GraphQLWsLink(wsClient);

// Use split to direct queries/mutations to HTTP and subscriptions to WebSocket
function createSplitLink() {
    return split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === "OperationDefinition" &&
                definition.operation === "subscription"
            );
        },
        wsLink,
        authLink.concat(httpLink) // Use authLink + httpLink for queries/mutations
    );
}

let splitLink = createSplitLink();

// Apollo Client
const client = new ApolloClient({
    link: from([errorLink, waitForTokenLink, splitLink]),
    cache: new InMemoryCache(),
});

/**
 * Restarts the WebSocket client with a fresh token
 * Called when the auth token is refreshed to re-establish subscriptions
 */
export function restartWsClient(): void {
    if (wsClient) {
        // Dispose of the old client (closes connection)
        wsClient.dispose();
    }

    // Create new WebSocket client and link
    wsClient = createWsClient();
    wsLink = new GraphQLWsLink(wsClient);

    // Recreate split link with new wsLink
    splitLink = createSplitLink();

    // Update Apollo Client's link
    client.setLink(from([errorLink, waitForTokenLink, splitLink]));
}

export default client;
