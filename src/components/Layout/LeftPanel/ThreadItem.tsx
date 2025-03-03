import React from "react";
import { useThreadsContext } from "@context";
import { Button, Col } from "react-bootstrap";

type ThreadItemProps = {
    threadId: string;
    title: string;
};

export const ThreadItem: React.FC<ThreadItemProps> = ({ threadId, title }) => {
    const { selectThread, selectedThreadId, generating } = useThreadsContext();

    const buttonClass = `w-100 ${selectedThreadId === threadId ? "active" : ""} btn btn-dark`;

    return (
        <Col xs="12">
            <Button
                variant="plain"
                onClick={() => selectThread(threadId)}
                className={buttonClass}
                disabled={generating}
            >
                {title}
            </Button>
        </Col>
    );
};
