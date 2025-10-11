import React, { useState, useCallback, useRef, useEffect } from "react";
import "./ResizablePanel.scss";

type ResizablePanelProps = {
    children: React.ReactNode;
    leftPanel: React.ReactNode;
    defaultWidth?: number;
    minWidth?: number;
    maxWidth?: number;
};

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
    children,
    leftPanel,
    defaultWidth = 400,
    minWidth = 300,
    maxWidth = 800,
}) => {
    const [leftWidth, setLeftWidth] = useState(defaultWidth);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback(() => {
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidth = e.clientX - containerRect.left;

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setLeftWidth(newWidth);
            }
        },
        [isResizing, minWidth, maxWidth]
    );

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "col-resize";
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
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return (
        <div className="resizable-container" ref={containerRef}>
            <div className="resizable-left" style={{ width: `${leftWidth}px` }}>
                {leftPanel}
            </div>
            <div
                className="resizable-divider"
                onMouseDown={handleMouseDown}
                role="separator"
                aria-orientation="vertical"
            />
            <div className="resizable-right">{children}</div>
        </div>
    );
};
