import { useModalZIndex } from "@signals";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./DraggableModal.scss";

export type DraggableModalProps = {
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    initialX?: number;
    initialY?: number;
    modalId?: string; // Unique identifier for z-index management
};

export const DraggableModal: React.FC<DraggableModalProps> = ({
    onClose,
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
        setIsResizing(false);
    }, []);

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

            const newWidth = Math.max(400, resizeStart.width + deltaX);
            const newHeight = Math.max(200, resizeStart.height + deltaY);

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
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                        aria-label="Close"
                    />
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
