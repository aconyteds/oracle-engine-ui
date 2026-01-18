import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "./components/firebase.ts";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";

import "./theme/main.scss";
import { ToasterProvider } from "@context";
import * as Sentry from "@sentry/react";

if (import.meta.env.VITE_ENV && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.VITE_ENV,
        tracesSampleRate: 0.1,
        integrations: [
            // send console.log, console.warn, and console.error calls as logs to Sentry
            Sentry.consoleLoggingIntegration({
                levels: ["log", "warn", "error"],
            }),
        ],
        // Enable logs to be sent to Sentry
        enableLogs: true,
        // Setting this option to true will send default PII data to Sentry.
        // For example, automatic IP address collection on events
        sendDefaultPii: false,
    });
    Sentry.logger.info(
        `Sentry initialized for user in ${import.meta.env.VITE_ENV}.`
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ToasterProvider>
            <ApolloProvider client={client}>
                <App />
            </ApolloProvider>
        </ToasterProvider>
    </StrictMode>
);
