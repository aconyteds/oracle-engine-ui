import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./DraggableModal.scss";

export type AssetType = "NPC" | "Location" | "POI" | "PLOT";

export type DraggableModalProps = {
    assetType: AssetType;
    id?: string;
    onClose: () => void;
    title?: string;
    initialX?: number;
    initialY?: number;
};

export const DraggableModal: React.FC<DraggableModalProps> = ({
    assetType,
    id,
    onClose,
    title,
    initialX = 100,
    initialY = 100,
}) => {
    const [position, setPosition] = useState({ x: initialX, y: initialY });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);

    const getTitle = () => {
        if (title) return title;
        const prefix = assetType === "POI" ? "POI" : assetType;
        return id ? `${prefix}: ${id}` : prefix;
    };

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!modalRef.current) return;

            const rect = modalRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
            setIsDragging(true);
        },
        []
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !modalRef.current) return;

            const container = modalRef.current.parentElement;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            const modalRect = modalRef.current.getBoundingClientRect();

            let newX = e.clientX - containerRect.left - dragOffset.x;
            let newY = e.clientY - containerRect.top - dragOffset.y;

            // Constrain to container bounds
            newX = Math.max(
                0,
                Math.min(newX, containerRect.width - modalRect.width)
            );
            newY = Math.max(
                0,
                Math.min(newY, containerRect.height - modalRect.height)
            );

            setPosition({ x: newX, y: newY });
        },
        [isDragging, dragOffset]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "move";
            document.body.style.userSelect = "none";
        } else {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            ref={modalRef}
            className="draggable-modal"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            data-testid="draggable-modal"
        >
            <div
                className="draggable-modal-header"
                onMouseDown={handleMouseDown}
                data-testid="draggable-modal-header"
            >
                <h5 className="draggable-modal-title">{getTitle()}</h5>
                <button
                    type="button"
                    className="draggable-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                    data-testid="draggable-modal-close"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>
            <div
                className="draggable-modal-body"
                data-testid="draggable-modal-body"
            >
                {assetType === "NPC" && (
                    <>
                        <div className="modal-section">
                            <div className="modal-image-placeholder">
                                <div className="placeholder-content">Image</div>
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Physical Description</h6>
                            <div className="modal-content-placeholder">
                                Physical description content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Motivation</h6>
                            <div className="modal-content-placeholder">
                                Motivation content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Mannerisms</h6>
                            <div className="modal-content-placeholder">
                                Mannerisms content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>DM Notes</h6>
                            <div className="modal-content-placeholder">
                                DM Notes content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Shared with Players</h6>
                            <div className="modal-content-placeholder">
                                Shared content
                            </div>
                        </div>
                    </>
                )}
                {assetType === "Location" && (
                    <>
                        <div className="modal-section">
                            <div className="modal-image-placeholder">
                                <div className="placeholder-content">Image</div>
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Description (Player-facing)</h6>
                            <div className="modal-content-placeholder">
                                Description content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Current Condition</h6>
                            <div className="modal-content-placeholder">
                                Current condition content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Points Of Interest</h6>
                            <div className="modal-content-placeholder">
                                Points of interest content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Characters</h6>
                            <div className="modal-content-placeholder">
                                Characters content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>DM Notes</h6>
                            <div className="modal-content-placeholder">
                                DM Notes content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Shared with Players</h6>
                            <div className="modal-content-placeholder">
                                Shared content
                            </div>
                        </div>
                    </>
                )}
                {assetType === "POI" && (
                    <>
                        <div className="modal-section">
                            <div className="modal-image-placeholder">
                                <div className="placeholder-content">Image</div>
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Description</h6>
                            <div className="modal-content-placeholder">
                                Description content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Current Condition</h6>
                            <div className="modal-content-placeholder">
                                Current condition content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Points Of Interest</h6>
                            <div className="modal-content-placeholder">
                                Points of interest content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Characters</h6>
                            <div className="modal-content-placeholder">
                                Characters content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>DM Notes</h6>
                            <div className="modal-content-placeholder">
                                DM Notes content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Shared with Players</h6>
                            <div className="modal-content-placeholder">
                                Shared content
                            </div>
                        </div>
                    </>
                )}
                {assetType === "PLOT" && (
                    <>
                        <div className="modal-section">
                            <h6>Summary</h6>
                            <div className="modal-content-placeholder">
                                Summary content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Status</h6>
                            <div className="modal-content-placeholder">
                                Status dropdown placeholder
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Urgency</h6>
                            <div className="modal-content-placeholder">
                                Urgency dropdown placeholder
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Related</h6>
                            <div className="modal-content-placeholder">
                                Related items content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Progress</h6>
                            <div className="modal-content-placeholder">
                                Progress checklist content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Notes</h6>
                            <div className="modal-content-placeholder">
                                Notes content
                            </div>
                        </div>
                        <div className="modal-section">
                            <h6>Shared with Players</h6>
                            <div className="modal-content-placeholder">
                                Shared content
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
