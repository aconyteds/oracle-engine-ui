import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { ScrollToBottomButton } from "./ScrollToBottomButton";

// Mock ResizeObserver
class ResizeObserverMock {
    observe() {
        // Mock implementation
    }
    unobserve() {
        // Mock implementation
    }
    disconnect() {
        // Mock implementation
    }
}

global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

describe("ScrollToBottomButton Component", () => {
    let containerRef: React.RefObject<HTMLDivElement>;
    let container: HTMLDivElement;

    beforeEach(() => {
        // Create a mock container element
        container = document.createElement("div");
        container.style.height = "500px";
        container.style.overflowY = "auto";
        document.body.appendChild(container);

        containerRef = { current: container };
    });

    afterEach(() => {
        cleanup();
        document.body.removeChild(container);
    });

    test("should not render when at bottom of scroll", () => {
        // Set scrollTop to 0 (at bottom for column-reverse)
        Object.defineProperty(container, "scrollTop", {
            writable: true,
            value: 0,
        });
        Object.defineProperty(container, "scrollHeight", {
            writable: true,
            value: 1000,
        });
        Object.defineProperty(container, "clientHeight", {
            writable: true,
            value: 500,
        });

        render(<ScrollToBottomButton containerRef={containerRef} />);

        const button = screen.queryByLabelText("Scroll to bottom");
        expect(button).not.toBeInTheDocument();
    });

    test("should render when scrolled up from bottom", () => {
        // Set scrollTop to -100 (scrolled up in column-reverse)
        Object.defineProperty(container, "scrollTop", {
            writable: true,
            value: -100,
        });
        Object.defineProperty(container, "scrollHeight", {
            writable: true,
            value: 1000,
        });
        Object.defineProperty(container, "clientHeight", {
            writable: true,
            value: 500,
        });

        render(<ScrollToBottomButton containerRef={containerRef} />);

        // Trigger scroll event to update visibility
        fireEvent.scroll(container);

        const button = screen.queryByLabelText("Scroll to bottom");
        expect(button).toBeInTheDocument();
    });

    test("should scroll to bottom when clicked", () => {
        // Set scrollTop to -100 (scrolled up)
        Object.defineProperty(container, "scrollTop", {
            writable: true,
            value: -100,
        });
        Object.defineProperty(container, "scrollHeight", {
            writable: true,
            value: 1000,
        });
        Object.defineProperty(container, "clientHeight", {
            writable: true,
            value: 500,
        });

        const scrollToMock = vi.fn();
        container.scrollTo = scrollToMock;

        render(<ScrollToBottomButton containerRef={containerRef} />);

        // Trigger scroll event to make button visible
        fireEvent.scroll(container);

        const button = screen.getByLabelText("Scroll to bottom");
        fireEvent.click(button);

        expect(scrollToMock).toHaveBeenCalledWith({
            top: 0,
            behavior: "smooth",
        });
    });

    test("should have proper styling classes", () => {
        Object.defineProperty(container, "scrollTop", {
            writable: true,
            value: -100,
        });
        Object.defineProperty(container, "scrollHeight", {
            writable: true,
            value: 1000,
        });
        Object.defineProperty(container, "clientHeight", {
            writable: true,
            value: 500,
        });

        render(<ScrollToBottomButton containerRef={containerRef} />);

        // Trigger scroll event to make button visible
        fireEvent.scroll(container);

        const button = screen.getByLabelText("Scroll to bottom");
        expect(button).toHaveClass("scroll-to-bottom-button");
        expect(button).toHaveClass("btn-link");
    });

    test("should render Font Awesome icon", () => {
        Object.defineProperty(container, "scrollTop", {
            writable: true,
            value: -100,
        });

        render(<ScrollToBottomButton containerRef={containerRef} />);

        // Trigger scroll event to make button visible
        fireEvent.scroll(container);

        const button = screen.getByLabelText("Scroll to bottom");
        const icon = button.querySelector("svg");
        expect(icon).toBeInTheDocument();
    });

    test("should handle null containerRef gracefully", () => {
        const nullRef: React.RefObject<HTMLDivElement> = { current: null };

        render(<ScrollToBottomButton containerRef={nullRef} />);

        // Should not throw error and button should not be visible
        const button = screen.queryByLabelText("Scroll to bottom");
        expect(button).not.toBeInTheDocument();
    });

    test("should update visibility on scroll events", () => {
        Object.defineProperty(container, "scrollTop", {
            writable: true,
            value: -100,
        });
        Object.defineProperty(container, "scrollHeight", {
            writable: true,
            value: 1000,
        });
        Object.defineProperty(container, "clientHeight", {
            writable: true,
            value: 500,
        });

        render(<ScrollToBottomButton containerRef={containerRef} />);

        // Initially scrolled up - button should appear after scroll event
        fireEvent.scroll(container);
        expect(screen.getByLabelText("Scroll to bottom")).toBeInTheDocument();

        // Scroll to bottom
        Object.defineProperty(container, "scrollTop", {
            writable: true,
            value: 0,
        });
        fireEvent.scroll(container);

        // Button should disappear
        expect(
            screen.queryByLabelText("Scroll to bottom")
        ).not.toBeInTheDocument();
    });
});
