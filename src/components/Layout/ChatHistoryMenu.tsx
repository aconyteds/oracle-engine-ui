import { useThreadsContext } from "@context";
import {
    faBars,
    faChevronDown,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
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

    const showNewChatButton =
        selectedThread !== null || threadList.length === 0;
    if (threadList.length === 0) {
        return null;
    }
    return (
        <Dropdown>
            <Dropdown.Toggle
                variant="outline-secondary"
                size="sm"
                id="chat-history-dropdown"
                disabled={isGenerating}
                className="d-flex align-items-center gap-2"
                bsPrefix="btn"
            >
                <FontAwesomeIcon icon={faBars} />
                <FontAwesomeIcon icon={faChevronDown} size="xs" />
            </Dropdown.Toggle>

            <Dropdown.Menu className="chat-history-dropdown" align="end">
                {selectedThread && (
                    <>
                        <Dropdown.Header className="text-primary">
                            {selectedThread.title}
                        </Dropdown.Header>
                        <Dropdown.Divider />
                    </>
                )}

                {(!selectedThread && threadList.length > 0) ||
                (selectedThread && threadList.length > 1) ? (
                    <Dropdown.Header>Chat History</Dropdown.Header>
                ) : null}
                <div className="thread-list">
                    {threadList.map((thread) => {
                        if (selectedThread?.id === thread.id) {
                            return null;
                        }

                        return (
                            <Dropdown.Item
                                key={thread.id}
                                onClick={() => handleSelectThread(thread.id)}
                                active={selectedThread?.id === thread.id}
                            >
                                {thread.title}
                            </Dropdown.Item>
                        );
                    })}
                    {showNewChatButton && (
                        <Dropdown.Item
                            onClick={handleNewChat}
                            disabled={isGenerating}
                        >
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            New Chat
                        </Dropdown.Item>
                    )}
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
};
