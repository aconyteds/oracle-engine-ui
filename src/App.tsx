import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import { Login } from "./components/Login";
import { ProtectedRoute } from "./components/Router";
import { LogEvent } from "./components/firebase";
import { Layout } from "./components/Layout";
import { ThreadsProvider, UserProvider } from "@context";

const App: React.FC = () => {
    LogEvent("load");

    return (
        <UserProvider>
            <Container fluid className="h-100 ps-0">
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
    );
};

export default App;
