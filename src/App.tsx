import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Grid, ChakraProvider } from "@chakra-ui/react";
import { Login } from "./components/Login";
import { ProtectedRoute } from "./components/Router";
import { LogEvent } from "./components/firebase";
import { Layout } from "./components/Layout";

const App: React.FC = () => {
  LogEvent("load");

  return (
    <ChakraProvider>
      <Grid height="100%" width="100%">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </Grid>
    </ChakraProvider>
  );
};

export default App;
