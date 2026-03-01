import { faCheckCircle, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCurrentUserQuery } from "@graphql";
import React, { useEffect } from "react";
import { Alert, Button, Card, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { LogEvent } from "../firebase";
import "./Subscription.scss";

export const SubscriptionSuccess: React.FC = () => {
    const navigate = useNavigate();

    // Refetch user data to pick up the new subscription tier
    useCurrentUserQuery({ fetchPolicy: "network-only" });

    useEffect(() => {
        LogEvent("subscription_success");

        const timer = setTimeout(() => {
            navigate("/");
        }, 15_000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <Container className="subscription-result d-flex justify-content-center align-items-center min-vh-100">
            <Card className="text-center p-4" style={{ maxWidth: "32rem" }}>
                <Card.Body>
                    <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="success-icon text-success mb-3"
                        size="4x"
                    />
                    <h2>Subscription Activated!</h2>
                    <p className="text-muted">
                        Your subscription has been successfully activated. Enjoy
                        your upgraded features!
                    </p>
                    <Alert variant="info" className="mt-4">
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <FontAwesomeIcon
                                    icon={faInfoCircle}
                                    className="me-2"
                                    size="3x"
                                />
                            </Col>
                            <Col className="text-start">
                                It can take a moment for everything to update,
                                so if you don't see changes right away, please
                                refresh your dashboard after a few seconds.
                            </Col>
                        </Row>
                    </Alert>
                    <Button variant="primary" onClick={() => navigate("/")}>
                        Go to Dashboard
                    </Button>
                    <p className="redirect-notice text-muted mt-3">
                        Redirecting automatically in 15 seconds...
                    </p>
                </Card.Body>
            </Card>
        </Container>
    );
};
