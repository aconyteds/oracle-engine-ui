import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "./components/firebase.ts";
import client from "./apolloClient";
import { ApolloProvider } from "@apollo/client";

import "./theme/main.scss";
import { ToasterProvider } from "@context";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ApolloProvider client={client}>
            <ToasterProvider>
                <App />
            </ToasterProvider>
        </ApolloProvider>
    </StrictMode>
);
