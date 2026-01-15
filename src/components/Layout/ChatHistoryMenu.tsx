import { useThreadsContext } from "@context";
import { faMap } from "@fortawesome/free-regular-svg-icons";
import {
    faBars,
    faChevronDown,
    faMapPin,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useMemo, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { formatRelativeTime } from "../../utils";
import "./ChatHistoryMenu.scss";

export const ChatHistoryMenu: React.FC = () => {
    const {
        threadList,
        selectThread,
        isGenerating,
        selectedThread,
        togglePinThread,
    } = useThreadsContext();
    const [showAll, setShowAll] = useState(false);

    const handleNewChat = () => {
        selectThread(null);
    };

    const handleSelectThread = (threadId: string) => {
        selectThread(threadId);
    };

    const handleTogglePin = (
        threadId: string,
        isPinned: boolean,
        event: React.MouseEvent
    ) => {
        event.stopPropagation();
        togglePinThread(threadId, isPinned);
    };

    const handleToggleShowAll = () => {
        setShowAll(!showAll);
    };

    // Organize threads into pinned and unpinned
    const { pinnedThreads, recentThreads, olderThreads } = useMemo(() => {
        const pinned = threadList.filter((thread) => thread.isPinned);
        const unpinned = threadList.filter((thread) => !thread.isPinned);

        // Sort unpinned by lastUsed (most recent first)
        const sortedUnpinned = [...unpinned].sort((a, b) => {
            const dateA = new Date(a.lastUsed).getTime();
            const dateB = new Date(b.lastUsed).getTime();
            return dateB - dateA;
        });

        const recent = sortedUnpinned.slice(0, 10);
        const older = sortedUnpinned.slice(10);

        return {
            pinnedThreads: pinned,
            recentThreads: recent,
            olderThreads: older,
        };
    }, [threadList]);

    if (threadList.length === 0) {
        return null;
    }

    const showNewChatButton =
        selectedThread !== null || threadList.length === 0;

    const renderThreadItem = (thread: (typeof threadList)[0]) => {
        const isSelected = selectedThread?.id === thread.id;
        const timeAgo = formatRelativeTime(thread.lastUsed);

        return (
            <Dropdown.Item
                key={thread.id}
                onClick={() => handleSelectThread(thread.id)}
                active={isSelected}
                className="thread-item d-flex justify-content-between align-items-center"
            >
                <div className="thread-info flex-grow-1">
                    <div className="thread-title">{thread.title}</div>
                    <div className="thread-time text-muted small">
                        {timeAgo}
                    </div>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-link p-0 ms-2 pin-button"
                    onClick={(e) =>
                        handleTogglePin(thread.id, !thread.isPinned, e)
                    }
                    aria-label={thread.isPinned ? "Unpin thread" : "Pin thread"}
                >
                    <FontAwesomeIcon
                        icon={thread.isPinned ? faMapPin : faMap}
                        className={
                            thread.isPinned ? "text-primary" : "text-muted"
                        }
                    />
                </button>
            </Dropdown.Item>
        );
    };

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

                {showNewChatButton && (
                    <Dropdown.Item
                        onClick={handleNewChat}
                        disabled={isGenerating}
                    >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        New Chat
                    </Dropdown.Item>
                )}

                {pinnedThreads.length > 0 && (
                    <>
                        <Dropdown.Divider />
                        <Dropdown.Header>
                            <FontAwesomeIcon icon={faMapPin} className="me-2" />
                            Pinned
                        </Dropdown.Header>
                        <div className="thread-list">
                            {pinnedThreads.map(renderThreadItem)}
                        </div>
                    </>
                )}

                {recentThreads.length > 0 && (
                    <>
                        <Dropdown.Divider />
                        <Dropdown.Header>Recent</Dropdown.Header>
                        <div className="thread-list">
                            {recentThreads.map(renderThreadItem)}
                        </div>
                    </>
                )}

                {olderThreads.length > 0 && (
                    <>
                        <Dropdown.Divider />
                        <Dropdown.Item
                            onClick={handleToggleShowAll}
                            className="show-all-toggle"
                        >
                            <FontAwesomeIcon
                                icon={faChevronDown}
                                className={`me-2 ${showAll ? "rotate-180" : ""}`}
                            />
                            {showAll
                                ? `Hide older (${olderThreads.length})`
                                : `Show all (${olderThreads.length} more)`}
                        </Dropdown.Item>
                        {showAll && (
                            <div className="thread-list thread-list-expanded">
                                {olderThreads.map(renderThreadItem)}
                            </div>
                        )}
                    </>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};
