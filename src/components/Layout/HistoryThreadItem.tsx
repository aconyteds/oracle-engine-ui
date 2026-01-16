import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRelativeTime } from "@hooks";
import React from "react";
import { Button, Dropdown } from "react-bootstrap";

type HistoryThreadItemProps = {
    thread: {
        id: string;
        title: string;
        lastUsed: Date | string;
        isPinned: boolean;
    };
    isSelected: boolean;
    onSelect: (threadId: string) => void;
    onTogglePin: (
        threadId: string,
        isPinned: boolean,
        event: React.MouseEvent
    ) => void;
};

export const HistoryThreadItem: React.FC<HistoryThreadItemProps> = ({
    thread,
    isSelected,
    onSelect,
    onTogglePin,
}) => {
    const timeAgo = useRelativeTime(thread.lastUsed);

    return (
        <Dropdown.Item
            key={thread.id}
            onClick={() => onSelect(thread.id)}
            active={isSelected}
            className="thread-item d-flex justify-content-between align-items-center"
        >
            <div className="thread-info flex-grow-1">
                <div className="thread-title">
                    <strong>{thread.title}</strong>
                </div>
                <div className="thread-time text-muted small">
                    <small>
                        <span className="fw-bold">{timeAgo}</span> ago
                    </small>
                </div>
            </div>
            <Button
                type="button"
                className="p-0 ms-2 pin-button"
                onClick={(e) => {
                    // Prevent dropdown item click
                    e.stopPropagation();
                    onTogglePin(thread.id, !thread.isPinned, e);
                }}
                aria-label={
                    thread.isPinned ? "Unfavorite thread" : "Favorite thread"
                }
                variant="link"
            >
                <FontAwesomeIcon
                    icon={thread.isPinned ? faStarSolid : faStar}
                    className={thread.isPinned ? "text-warning" : "text-muted"}
                />
            </Button>
        </Dropdown.Item>
    );
};
