import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./components/firebase.ts";
import { ColorModeScript } from "@chakra-ui/react";
import theme from "./theme.tsx";

createRoot(document.getElementById("root")!).render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <StrictMode>
      <App />
    </StrictMode>
  </>
);
