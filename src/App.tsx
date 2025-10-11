import { ThemeProvider, ThreadsProvider, UserProvider } from "@context";
import React from "react";
import { Container } from "react-bootstrap";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { LogEvent } from "./components/firebase";
import { Layout } from "./components/Layout";
import { Login } from "./components/Login";
import { ProtectedRoute } from "./components/Router";

const App: React.FC = () => {
    LogEvent("load");

    return (
        <ThemeProvider>
            <UserProvider>
                <Container fluid className="h-100 ps-0 pe-0">
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <ThreadsProvider>
                                            <Layout />
                                        </ThreadsProvider>
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </Router>
                </Container>
            </UserProvider>
        </ThemeProvider>
    );
};

export default App;
