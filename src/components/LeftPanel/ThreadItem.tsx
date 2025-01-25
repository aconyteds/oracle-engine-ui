import React from "react";
import { useThreadsContext } from "@context";
import { Button } from "react-bootstrap";

type ThreadItemProps = {
    threadId: string;
    title: string;
};

export const ThreadItem: React.FC<ThreadItemProps> = ({ threadId, title }) => {
    const { selectThread } = useThreadsContext();
    return (
        <Button variant="plain" onClick={() => selectThread(threadId)}>
            {title}
        </Button>
    );
};
