import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "./components/firebase.ts";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";

import "./theme/main.scss";
import { ToasterProvider } from "@context";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ToasterProvider>
            <ApolloProvider client={client}>
                <App />
            </ApolloProvider>
        </ToasterProvider>
    </StrictMode>
);
