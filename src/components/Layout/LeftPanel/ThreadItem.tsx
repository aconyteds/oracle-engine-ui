import React from "react";
import { useThreadsContext } from "@context";
import { Button, Col } from "react-bootstrap";

type ThreadItemProps = {
    threadId: string;
    title: string;
    onSelect?: () => void;
};

export const ThreadItem: React.FC<ThreadItemProps> = ({
    threadId,
    title,
    onSelect,
}) => {
    const { selectThread, selectedThreadId, generating } = useThreadsContext();

    const buttonClass = `w-100 ${selectedThreadId === threadId ? "active" : ""} btn btn-dark`;

    const handleClick = () => {
        if (onSelect) {
            onSelect();
        } else {
            selectThread(threadId);
        }
    };

    return (
        <Col xs="12">
            <Button
                variant="plain"
                onClick={handleClick}
                className={buttonClass}
                disabled={generating}
            >
                {title}
            </Button>
        </Col>
    );
};
