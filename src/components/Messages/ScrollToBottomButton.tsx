import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "./ScrollToBottomButton.scss";

interface ScrollToBottomButtonProps {
    containerRef: React.RefObject<HTMLDivElement>;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
    containerRef,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const checkScrollPosition = useCallback(() => {
        if (!containerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        // The container uses flex-direction: column-reverse, so scrollTop is 0 when at bottom
        // When scrolled up, scrollTop becomes negative
        const isAtBottom = Math.abs(scrollTop) < 50;
        setIsVisible(!isAtBottom);
    }, [containerRef]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Check initial scroll position
        checkScrollPosition();

        // Listen to scroll events
        container.addEventListener("scroll", checkScrollPosition);

        // Also observe for content changes (new messages)
        const resizeObserver = new ResizeObserver(checkScrollPosition);
        resizeObserver.observe(container);

        return () => {
            container.removeEventListener("scroll", checkScrollPosition);
            resizeObserver.disconnect();
        };
    }, [containerRef, checkScrollPosition]);

    const scrollToBottom = useCallback(() => {
        if (!containerRef.current) return;
        containerRef.current.scrollTo({
            top: 0, // In column-reverse, top: 0 is the bottom
            behavior: "smooth",
        });
    }, [containerRef]);

    if (!isVisible) return null;

    return (
        <Button
            variant="link"
            className="scroll-to-bottom-button"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
        >
            <FontAwesomeIcon icon={faChevronDown} />
        </Button>
    );
};
