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
        // Setting this option to true will send default PII data to Sentry.
        // For example, automatic IP address collection on events
        sendDefaultPii: true,
    });
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
