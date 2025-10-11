import React from "react";
import { Offcanvas, Button } from "react-bootstrap";
import { useThreadsContext } from "@context";
import { ThreadItem } from "./LeftPanel/ThreadItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import "./ChatHistoryFlyout.scss";

type ChatHistoryFlyoutProps = {
    show: boolean;
    onHide: () => void;
};

export const ChatHistoryFlyout: React.FC<ChatHistoryFlyoutProps> = ({
    show,
    onHide,
}) => {
    const { threadList, selectThread, generating } = useThreadsContext();

    const handleNewChat = () => {
        selectThread(null);
        onHide();
    };

    const handleSelectThread = (threadId: string) => {
        selectThread(threadId);
        onHide();
    };

    return (
        <Offcanvas show={show} onHide={onHide} placement="start">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Chat History</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="chat-history-body">
                <Button
                    className="mb-3 w-100"
                    onClick={handleNewChat}
                    disabled={generating}
                >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    New Chat
                </Button>
                <div className="thread-list">
                    {threadList.map((thread) => (
                        <ThreadItem
                            key={thread.id}
                            threadId={thread.id}
                            title={thread.title}
                            onSelect={() => handleSelectThread(thread.id)}
                        />
                    ))}
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
};
