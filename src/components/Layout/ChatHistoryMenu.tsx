import { useThreadsContext } from "@context";
import {
    faBars,
    faChevronDown,
    faChevronUp,
    faPlus,
    faStar as faStarSolid,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useMemo, useState } from "react";
import { Collapse, Dropdown } from "react-bootstrap";
import { HistoryThreadItem } from "./HistoryThreadItem";
import "./ChatHistoryMenu.scss";

const THREADS_TO_SHOW_INITIALLY = 3;

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

    const handleToggleShowAll = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent dropdown item click
        e.stopPropagation();
        setShowAll(!showAll);
    };

    // Organize threads into pinned and unpinned
    const { pinnedThreads, recentThreads, olderThreads } = useMemo(() => {
        const pinned: typeof threadList = [];
        const unpinned: typeof threadList = [];

        // Single pass to partition threads
        for (const thread of threadList) {
            if (thread.isPinned) {
                pinned.push(thread);
            } else {
                unpinned.push(thread);
            }
        }

        // Sort unpinned by lastUsed (most recent first)
        const sortedUnpinned = unpinned.sort((a, b) => {
            // Pre-compute timestamps once for comparison
            return (
                new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
            );
        });

        const recent = sortedUnpinned.slice(0, THREADS_TO_SHOW_INITIALLY);
        const older = sortedUnpinned.slice(THREADS_TO_SHOW_INITIALLY);

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
                    <>
                        <Dropdown.Item
                            onClick={handleNewChat}
                            disabled={isGenerating}
                        >
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            New Chat
                        </Dropdown.Item>
                        <Dropdown.Divider />
                    </>
                )}

                {pinnedThreads.length > 0 && (
                    <>
                        <Dropdown.Header>
                            <FontAwesomeIcon
                                icon={faStarSolid}
                                className="me-2"
                            />
                            Favorite Threads
                        </Dropdown.Header>
                        <div className="thread-list">
                            {pinnedThreads.map((thread) => (
                                <HistoryThreadItem
                                    key={thread.id}
                                    thread={thread}
                                    isSelected={
                                        selectedThread?.id === thread.id
                                    }
                                    onSelect={handleSelectThread}
                                    onTogglePin={handleTogglePin}
                                />
                            ))}
                        </div>
                    </>
                )}

                {recentThreads.length > 0 && (
                    <>
                        <Dropdown.Divider />
                        <Dropdown.Header>Recent</Dropdown.Header>
                        <div className="thread-list">
                            {recentThreads.map((thread) => (
                                <HistoryThreadItem
                                    key={thread.id}
                                    thread={thread}
                                    isSelected={
                                        selectedThread?.id === thread.id
                                    }
                                    onSelect={handleSelectThread}
                                    onTogglePin={handleTogglePin}
                                />
                            ))}
                        </div>
                    </>
                )}

                {olderThreads.length > 0 && (
                    <>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleToggleShowAll}>
                            <div className="d-flex justify-content-between align-items-center cursor-pointer">
                                {showAll
                                    ? `Hide older (${olderThreads.length})`
                                    : `Show all (${olderThreads.length} more)`}
                                <FontAwesomeIcon
                                    icon={showAll ? faChevronUp : faChevronDown}
                                />
                            </div>
                        </Dropdown.Item>
                        <Collapse in={showAll}>
                            <div>
                                {olderThreads.map((thread) => (
                                    <HistoryThreadItem
                                        key={thread.id}
                                        thread={thread}
                                        isSelected={
                                            selectedThread?.id === thread.id
                                        }
                                        onSelect={handleSelectThread}
                                        onTogglePin={handleTogglePin}
                                    />
                                ))}
                            </div>
                        </Collapse>
                    </>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};
