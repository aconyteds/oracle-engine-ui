import React from "react";
import { useThreadsContext } from "@context";
import { ThreadItem } from "./ThreadItem";
import { Row, Button, Col } from "react-bootstrap";
import { HealthCheck } from "../HealthCheck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import "./LeftPanel.scss";

export const LeftPanel: React.FC = () => {
    const { threadList, selectThread, generating } = useThreadsContext();

    return (
        <div className="left-panel">
            <Row className="flex-shrink-0 mb-4">
                <Col xs="auto">
                    <Button
                        onClick={() => selectThread(null)}
                        disabled={generating}
                    >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
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
        </div>
    );
};
