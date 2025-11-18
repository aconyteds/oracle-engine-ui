import { faWindowMinimize } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModalZIndex } from "@signals";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./DraggableModal.scss";

// Minimum visible pixels of modal header to keep accessible
const MIN_VISIBLE_HEADER_PX = 50;

// Minimum dimensions for modal
const MIN_WIDTH_PX = 400;
const MIN_HEIGHT_PX = 200;

export type DraggableModalProps = {
    onClose: () => void;
    onMinimize?: () => void;
    onPositionChange?: (position: { x: number; y: number }) => void;
    title: string | React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    initialX?: number;
    initialY?: number;
    modalId?: string; // Unique identifier for z-index management
};

export const DraggableModal: React.FC<DraggableModalProps> = ({
    onClose,
    onMinimize,
    onPositionChange,
    title,
    children,
    footer,
    initialX = 100,
    initialY = 100,
    modalId,
}) => {
    const [position, setPosition] = useState({ x: initialX, y: initialY });
    const [size, setSize] = useState({ width: 500, height: 0 }); // height 0 = auto
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const modalRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef(position);

    // Keep position ref in sync with position state
    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    // Generate a unique modal ID if not provided
    const uniqueModalId = modalId || `modal-${title}-${new Date().getTime()}`;
    const { zIndex, bringToFront } = useModalZIndex(uniqueModalId);

    const handleModalClick = useCallback(() => {
        // Bring this modal to front when clicked
        bringToFront();
    }, [bringToFront]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            // Bring to front when starting to drag
            bringToFront();

            // Prevent dragging when clicking close button or other interactive elements
            if (
                e.target instanceof HTMLElement &&
                (e.target.closest("button") || e.target.closest(".btn-close"))
            ) {
                return;
            }

            if (!modalRef.current) return;

            const rect = modalRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
            setIsDragging(true);
        },
        [bringToFront]
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

            // Allow partial off-screen positioning, but keep MIN_VISIBLE_HEADER_PX visible
            // Left boundary: keep right edge of MIN_VISIBLE_HEADER_PX visible
            const minX = -(modalRect.width - MIN_VISIBLE_HEADER_PX);
            // Right boundary: keep left edge of MIN_VISIBLE_HEADER_PX visible
            const maxX = containerRect.width - MIN_VISIBLE_HEADER_PX;
            // Top boundary: always keep header visible
            const minY = 0;
            // Bottom boundary: keep MIN_VISIBLE_HEADER_PX of header visible
            const maxY = containerRect.height - MIN_VISIBLE_HEADER_PX;

            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));

            setPosition({ x: newX, y: newY });
        },
        [isDragging, dragOffset]
    );

    const handleMouseUp = useCallback(() => {
        // Notify parent of final position when either drag or resize ends
        // Resize can change position if modal grows beyond container bounds
        if ((isDragging || isResizing) && onPositionChange) {
            // Use ref to get the latest position without stale closure
            onPositionChange(positionRef.current);
        }
        setIsDragging(false);
        setIsResizing(false);
    }, [isDragging, isResizing, onPositionChange]);

    // Resize handlers
    const handleResizeStart = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation(); // Prevent drag from starting
            bringToFront();

            if (!modalRef.current) return;

            const rect = modalRef.current.getBoundingClientRect();
            setResizeStart({
                x: e.clientX,
                y: e.clientY,
                width: rect.width,
                height: rect.height,
            });
            setIsResizing(true);
        },
        [bringToFront]
    );

    const handleResizeMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !modalRef.current) return;

            const deltaX = e.clientX - resizeStart.x;
            const deltaY = e.clientY - resizeStart.y;

            // Apply minimum size constraints
            const newWidth = Math.max(MIN_WIDTH_PX, resizeStart.width + deltaX);
            const newHeight = Math.max(
                MIN_HEIGHT_PX,
                resizeStart.height + deltaY
            );

            setSize({ width: newWidth, height: newHeight });
        },
        [isResizing, resizeStart]
    );

    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "move";
            document.body.style.userSelect = "none";
        } else if (isResizing) {
            document.addEventListener("mousemove", handleResizeMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "nwse-resize";
            document.body.style.userSelect = "none";
        } else {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mousemove", handleResizeMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mousemove", handleResizeMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [
        isDragging,
        isResizing,
        handleMouseMove,
        handleResizeMove,
        handleMouseUp,
    ]);

    return (
        <div
            ref={modalRef}
            className="draggable-modal-wrapper modal show d-flex"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                position: "absolute",
                zIndex,
                width: `${size.width}px`,
                height: size.height > 0 ? `${size.height}px` : "auto",
            }}
            onClick={handleModalClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    handleModalClick();
                }
            }}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            data-testid="draggable-modal"
        >
            <div className="modal-content">
                {/* Resize handle */}
                <div
                    className="resize-handle"
                    onMouseDown={handleResizeStart}
                    data-testid="resize-handle"
                />
                <div
                    className={`modal-header ${isDragging ? "dragging" : ""}`}
                    onMouseDown={handleMouseDown}
                    style={{ cursor: "move" }}
                    data-testid="draggable-modal-header"
                >
                    <h5 className="modal-title">{title}</h5>
                    <div className="d-flex gap-2 align-items-center">
                        {onMinimize && (
                            <button
                                type="button"
                                className="btn btn-sm btn-link text-secondary p-0"
                                onClick={onMinimize}
                                aria-label="Minimize"
                                title="Minimize"
                            >
                                <FontAwesomeIcon icon={faWindowMinimize} />
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        />
                    </div>
                </div>
                <div className="modal-body" data-testid="draggable-modal-body">
                    {children}
                </div>
                {footer && (
                    <div
                        className="modal-footer"
                        data-testid="draggable-modal-footer"
                    >
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
