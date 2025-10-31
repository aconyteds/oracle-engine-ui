import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, ButtonProps } from "react-bootstrap";
import "./HoldConfirmButton.scss";

export interface HoldConfirmButtonProps extends ButtonProps {
    /**
     * Duration in milliseconds that the button must be held before confirming
     * @default 2000
     */
    holdDuration?: number;
    /**
     * Callback fired when the hold duration completes
     */
    onConfirm: () => void | Promise<void>;
}

/**
 * A confirmation button that requires the user to press and hold for a
 * configurable duration before executing the action. Provides visual feedback
 * with a left-to-right fill animation using Bootstrap theme colors.
 *
 * Supports mouse, touch, and keyboard (Space/Enter) interactions.
 */
export const HoldConfirmButton: React.FC<HoldConfirmButtonProps> = ({
    holdDuration = 2000,
    onConfirm,
    children,
    disabled,
    className = "",
    variant = "primary",
    ...buttonProps
}) => {
    const rafId = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [progressColor, setProgressColor] = useState<string>("");

    /**
     * Extract and lighten the button's background color for the progress bar
     */
    useEffect(() => {
        if (!buttonRef.current) return;

        const computedStyle = window.getComputedStyle(buttonRef.current);
        const bgColor = computedStyle.backgroundColor;

        // Parse RGB values and create a lighter version
        const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);

            // Lighten the color by mixing with white (40% lighter)
            const lighterR = Math.min(255, Math.floor(r + (255 - r) * 0.4));
            const lighterG = Math.min(255, Math.floor(g + (255 - g) * 0.4));
            const lighterB = Math.min(255, Math.floor(b + (255 - b) * 0.4));

            setProgressColor(`rgb(${lighterR}, ${lighterG}, ${lighterB})`);
        }
    }, []);

    /**
     * Cancels any ongoing hold animation
     */
    const cancelHold = useCallback(() => {
        if (rafId.current !== null) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }
        startTimeRef.current = null;

        // Use CSS transition for rapid drain
        if (progressRef.current) {
            progressRef.current.style.transition = "width 0.2s ease-out";
            progressRef.current.style.width = "0%";
        }
    }, []);

    /**
     * Starts the hold animation
     */
    const startHold = useCallback(() => {
        if (disabled || !progressRef.current) return;

        // Remove transition for smooth requestAnimationFrame updates
        progressRef.current.style.transition = "none";
        startTimeRef.current = performance.now();

        const animate = (currentTime: number) => {
            if (startTimeRef.current === null || !progressRef.current) return;

            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min((elapsed / holdDuration) * 100, 100);

            // Directly update DOM for smooth animation
            progressRef.current.style.width = `${progress}%`;

            if (progress >= 100) {
                // Hold completed - trigger confirmation
                cancelHold();
                onConfirm();
            } else {
                rafId.current = requestAnimationFrame(animate);
            }
        };

        rafId.current = requestAnimationFrame(animate);
    }, [disabled, holdDuration, onConfirm, cancelHold]);

    /**
     * Handle mouse down event
     */
    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            startHold();
        },
        [startHold]
    );

    /**
     * Handle mouse up event
     */
    const handleMouseUp = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            cancelHold();
        },
        [cancelHold]
    );

    /**
     * Handle mouse leave event (cancel if user drags away)
     */
    const handleMouseLeave = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            cancelHold();
        },
        [cancelHold]
    );

    /**
     * Handle touch start event
     */
    const handleTouchStart = useCallback(
        (e: React.TouchEvent<HTMLButtonElement>) => {
            e.preventDefault();
            startHold();
        },
        [startHold]
    );

    /**
     * Handle touch end event
     */
    const handleTouchEnd = useCallback(
        (e: React.TouchEvent<HTMLButtonElement>) => {
            e.preventDefault();
            cancelHold();
        },
        [cancelHold]
    );

    /**
     * Handle touch cancel event
     */
    const handleTouchCancel = useCallback(
        (e: React.TouchEvent<HTMLButtonElement>) => {
            e.preventDefault();
            cancelHold();
        },
        [cancelHold]
    );

    /**
     * Handle key down event (Space/Enter)
     */
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                // Only start if not already holding (prevent repeat key events)
                if (!rafId.current) {
                    startHold();
                }
            }
        },
        [startHold]
    );

    /**
     * Handle key up event
     */
    const handleKeyUp = useCallback(
        (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                cancelHold();
            }
        },
        [cancelHold]
    );

    /**
     * Prevent default click behavior to avoid instant submission
     */
    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
        },
        []
    );

    return (
        <Button
            {...buttonProps}
            ref={buttonRef}
            variant={variant}
            disabled={disabled}
            className={`hold-confirm-button ${className}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onClick={handleClick}
        >
            <div
                ref={progressRef}
                className="hold-confirm-progress"
                style={{
                    backgroundColor: progressColor,
                }}
            />
            <span className="hold-confirm-content">{children}</span>
        </Button>
    );
};
