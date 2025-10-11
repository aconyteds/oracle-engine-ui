import React, { useState } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { ThemeToggle } from "../Common/ThemeToggle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useThreadsContext } from "@context";
import { ChatHistoryFlyout } from "./ChatHistoryFlyout";

export const Header: React.FC = () => {
    const [showFlyout, setShowFlyout] = useState(false);
    const { selectedThread } = useThreadsContext();

    return (
        <>
            <header className="ps-2">
                <Row className="justify-content-between align-items-center">
                    <Col xs="auto" className="d-flex align-items-center gap-2">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setShowFlyout(true)}
                        >
                            <FontAwesomeIcon icon={faBars} />
                        </Button>
                        <div>
                            <h1 className="mb-0">Oracle-Engine</h1>
                            {selectedThread && (
                                <small className="text-muted">
                                    {selectedThread.title}
                                </small>
                            )}
                        </div>
                    </Col>
                    <Col xs="auto">
                        <ThemeToggle />
                    </Col>
                </Row>
            </header>
            <ChatHistoryFlyout
                show={showFlyout}
                onHide={() => setShowFlyout(false)}
            />
        </>
    );
};
