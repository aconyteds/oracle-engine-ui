import { useThreadsContext } from "@context";
import React from "react";
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
    const { selectThread, selectedThreadId, isGenerating } =
        useThreadsContext();

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
                disabled={isGenerating}
            >
                {title}
            </Button>
        </Col>
    );
};
