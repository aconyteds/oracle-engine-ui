import { useThreadsContext } from "@context";
import { faBars, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Dropdown } from "react-bootstrap";
import "./ChatHistoryMenu.scss";

export const ChatHistoryMenu: React.FC = () => {
    const { threadList, selectThread, isGenerating, selectedThread } =
        useThreadsContext();

    const handleNewChat = () => {
        selectThread(null);
    };

    const handleSelectThread = (threadId: string) => {
        selectThread(threadId);
    };

    return (
        <Dropdown>
            <Dropdown.Toggle
                variant="outline-secondary"
                size="sm"
                id="chat-history-dropdown"
                disabled={isGenerating}
            >
                <FontAwesomeIcon icon={faBars} />
            </Dropdown.Toggle>

            <Dropdown.Menu className="chat-history-dropdown" align="end">
                <Dropdown.Header>Chat History</Dropdown.Header>
                <Dropdown.Item onClick={handleNewChat} disabled={isGenerating}>
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    New Chat
                </Dropdown.Item>
                <Dropdown.Divider />
                <div className="thread-list">
                    {threadList.map((thread) => (
                        <Dropdown.Item
                            key={thread.id}
                            onClick={() => handleSelectThread(thread.id)}
                            active={selectedThread?.id === thread.id}
                        >
                            {thread.title}
                        </Dropdown.Item>
                    ))}
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
};
