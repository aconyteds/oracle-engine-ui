import React, { useCallback, useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { LogEvent } from "../firebase";

export const MarketingScreen: React.FC = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            // Log interest event to Firebase Analytics
            LogEvent("waitlist_interest", {
                email: email || "not_provided",
                timestamp: new Date().toISOString(),
            });

            setSubmitted(true);
            setEmail("");
        },
        [email]
    );

    return (
        <Container className="d-flex justify-content-center align-items-center h-100">
            <Card
                style={{ maxWidth: "65rem", maxHeight: "98vh" }}
                className="w-100"
            >
                <Card.Body className="overflow-auto">
                    <h1 className="display-4 mb-3">Oracle-Engine</h1>

                    <p className="mb-4">
                        Your AI-powered companion for epic storytelling.
                        Oracle-Engine is currently in development, and we're
                        crafting something special for storytellers like you.
                    </p>

                    <h2 className="h4 mb-3">Build Worlds, Not Spreadsheets</h2>

                    <p className="mb-4">
                        Imagine creating a fully realized campaign world in
                        hours, not weeks. Oracle-Engine uses specialized AI
                        agents to help you craft rich NPCs, immersive locations,
                        and compelling storylines—all tailored to your setting
                        and theme. Spend less time on prep work and more time
                        bringing your story to life at the table.
                    </p>

                    <h2 className="h4 mb-3">Your Campaign, Always at Hand</h2>

                    <p className="mb-4">
                        Never lose track of your story again. Oracle-Engine
                        captures session notes automatically, generates detailed
                        summaries, and intelligently links characters and quests
                        as your campaign unfolds. When players throw you a
                        curveball, simply ask the AI for suggestions on how to
                        adapt your story—whether they've befriended the villain
                        or accidentally started a war.
                    </p>

                    <h2 className="h4 mb-3">Powered by Intelligence</h2>

                    <p className="mb-4">
                        Oracle-Engine combines cutting-edge AI agents with
                        advanced retrieval techniques to understand your
                        campaign deeply. Generate NPCs with authentic
                        backstories and faction connections. Create plots that
                        respond to player choices. Search your campaign assets
                        conversationally or dive into the details manually. The
                        engine learns your world and helps you maintain
                        consistency while embracing the unexpected twists that
                        make tabletop gaming magical.
                    </p>

                    <h2 className="h4 mb-3">Coming Soon</h2>

                    <p className="mb-4">
                        We're working hard to bring Oracle-Engine to
                        storytellers everywhere. Sign up below to be notified
                        when we launch and receive early access to the platform.
                        The age of effortless worldbuilding is almost here.
                    </p>

                    {submitted ? (
                        <div className="alert alert-success" role="alert">
                            <strong>Thank you for your interest!</strong> We've
                            recorded your request and will keep you updated on
                            our progress.
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <Button type="submit" variant="primary">
                                    Get Early Access
                                </Button>
                            </div>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};
