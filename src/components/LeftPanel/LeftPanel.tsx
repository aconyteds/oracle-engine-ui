import React from "react";
import { useThreadsContext } from "@context";
import { ThreadItem } from "./ThreadItem";
import { Row, Button, Col } from "react-bootstrap";

export const LeftPanel: React.FC = () => {
    const { threadList, selectThread } = useThreadsContext();

    return (
        <Row className="pt-2 h-100 flex-column">
            <Col className="mb-4" xs="auto">
                <Button onClick={() => selectThread(null)}>
                    Create Thread
                </Button>
            </Col>
            <Col>
                {threadList.map((thread) => (
                    <ThreadItem
                        key={thread.id}
                        threadId={thread.id}
                        title={thread.title}
                    />
                ))}
            </Col>
        </Row>
    );
};
