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
import { createClient } from "graphql-ws";
import { getCurrentCampaignId } from "./contexts/Campaign.context";

// Environment variables
const apiUrl = import.meta.env.VITE_API_URL; // HTTP endpoint
const wsUrl = import.meta.env.VITE_WS_URL; // WebSocket endpoint

// Store token dynamically
let authToken: string | null = null;

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

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
    createClient({
        url: wsUrl,
        connectionParams: () => {
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
    })
);

// Use split to direct queries/mutations to HTTP and subscriptions to WebSocket
const splitLink = split(
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

// Apollo Client
const client = new ApolloClient({
    link: from([waitForTokenLink, splitLink]),
    cache: new InMemoryCache(),
});

export default client;
