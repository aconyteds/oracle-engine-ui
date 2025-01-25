import React from "react";
import { useThreadsContext } from "@context";
import { ThreadItem } from "./ThreadItem";
import { Row, Button, Col } from "react-bootstrap";

export const LeftPanel: React.FC = () => {
    const { threadList, selectThread, generating } = useThreadsContext();

    return (
        <Col className="h-100 pt-2 pb-2 border-end border-1">
            <Row>
                <Col className="mb-4" xs="auto">
                    <Button
                        onClick={() => selectThread(null)}
                        disabled={generating}
                    >
                        Create Thread
                    </Button>
                </Col>
            </Row>
            <Row className="flex-column gap-2">
                {threadList.map((thread) => (
                    <ThreadItem
                        key={thread.id}
                        threadId={thread.id}
                        title={thread.title}
                    />
                ))}
            </Row>
        </Col>
    );
};
