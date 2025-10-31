import {
    ApolloClient,
    ApolloLink,
    from,
    HttpLink,
    InMemoryCache,
    split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition, Observable } from "@apollo/client/utilities";
import { Client, createClient } from "graphql-ws";
import { getCurrentCampaignId } from "./contexts/Campaign.context";

// Environment variables
const apiUrl = import.meta.env.VITE_API_URL; // HTTP endpoint
const wsUrl = import.meta.env.VITE_WS_URL; // WebSocket endpoint

// Store token dynamically
let authToken: string | null = null;

// Store WebSocket client for reconnection
let wsClient: Client | null = null;

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

// Create WebSocket client with lazy connectionParams for token refresh
function createWsClient(): Client {
    return createClient({
        url: wsUrl,
        connectionParams: async () => {
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
    link: from([waitForTokenLink, splitLink]),
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
    client.setLink(from([waitForTokenLink, splitLink]));
}

export default client;
