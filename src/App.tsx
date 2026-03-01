import {
    CampaignProvider,
    ThemeProvider,
    ThreadsProvider,
    UserProvider,
} from "@context";
import React from "react";
import { Container } from "react-bootstrap";
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from "react-router-dom";
import { CampaignRequirement } from "./components/Campaign";
import { LogEvent } from "./components/firebase";
import { Layout } from "./components/Layout";
import { Login } from "./components/Login";
import { ActiveUserRequirement, ProtectedRoute } from "./components/Router";
import {
    SubscriptionPage,
    SubscriptionSuccess,
} from "./components/Subscription";
import { useFeatures } from "./hooks";

const App: React.FC = () => {
    LogEvent("load");
    const { monetizationEnabled } = useFeatures();

    return (
        <ThemeProvider>
            <UserProvider>
                <CampaignProvider>
                    <Container fluid className="h-100 ps-0 pe-0">
                        <Router>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                {monetizationEnabled ? (
                                    <>
                                        <Route
                                            path="/subscription"
                                            element={
                                                <ProtectedRoute>
                                                    <SubscriptionPage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/subscription/success"
                                            element={
                                                <ProtectedRoute>
                                                    <SubscriptionSuccess />
                                                </ProtectedRoute>
                                            }
                                        />
                                    </>
                                ) : (
                                    <Route
                                        path="/subscription/*"
                                        element={<Navigate to="/" replace />}
                                    />
                                )}
                                <Route
                                    path="/"
                                    element={
                                        <ProtectedRoute>
                                            <ActiveUserRequirement>
                                                <CampaignRequirement>
                                                    <ThreadsProvider>
                                                        <Layout />
                                                    </ThreadsProvider>
                                                </CampaignRequirement>
                                            </ActiveUserRequirement>
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </Router>
                    </Container>
                </CampaignProvider>
            </UserProvider>
        </ThemeProvider>
    );
};

export default App;
