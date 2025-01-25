import React from "react";
import { useThreadsContext } from "@context";
import { ThreadItem } from "./ThreadItem";
import { Row, Button, Col } from "react-bootstrap";
import { HealthCheck } from "../HealthCheck";

export const LeftPanel: React.FC = () => {
    const { threadList, selectThread, generating } = useThreadsContext();

    return (
        <Col className="h-100 pt-2 pb-2 border-end border-1 d-flex flex-column">
            <Row className="flex-shrink-0 mb-4">
                <Col xs="auto">
                    <Button
                        onClick={() => selectThread(null)}
                        disabled={generating}
                    >
                        Create Thread
                    </Button>
                </Col>
            </Row>

            {/* Scrollable thread list */}
            <Row className="flex-grow-1 flex-column gap-2 overflow-auto align-items-start">
                {threadList.map((thread) => (
                    <ThreadItem
                        key={thread.id}
                        threadId={thread.id}
                        title={thread.title}
                    />
                ))}
            </Row>

            {/* Footer */}
            <Row className="flex-shrink-0 mt-2">
                <Col>
                    <HealthCheck />
                </Col>
            </Row>
        </Col>
    );
};
