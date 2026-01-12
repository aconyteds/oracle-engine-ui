import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FeedbackModal } from "./FeedbackModal";

// Mock MarkdownRenderer
vi.mock("../Common", () => ({
    MarkdownRenderer: ({ content }: { content: string }) => (
        <div data-testid="markdown-renderer">{content}</div>
    ),
}));

describe("FeedbackModal Component", () => {
    const mockOnSubmit = vi.fn();
    const defaultProps = {
        show: true,
        onSubmit: mockOnSubmit,
        messageContent: "Original Message Content",
    };

    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it("renders correctly when shown", () => {
        render(<FeedbackModal {...defaultProps} />);

        expect(screen.getByText("Send Feedback")).toBeInTheDocument();
        expect(screen.getByText("Additional Context")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Submit" })
        ).toBeInTheDocument();
    });

    it("does not render when show is false", () => {
        render(<FeedbackModal {...defaultProps} show={false} />);
        expect(screen.queryByText("Send Feedback")).not.toBeInTheDocument();
    });

    it("displays original message content when toggled", () => {
        render(<FeedbackModal {...defaultProps} />);

        // Initially collapsed - check aria-expanded state
        const toggleContainer = screen
            .getByText("Show Original Message")
            .closest("[aria-expanded]");
        expect(toggleContainer).toHaveAttribute("aria-expanded", "false");

        // Click to expand
        fireEvent.click(toggleContainer!);

        // Now expanded
        expect(toggleContainer).toHaveAttribute("aria-expanded", "true");
        expect(
            screen.getByText("Original Message Content")
        ).toBeInTheDocument();
    });

    it("handles comment input changes", () => {
        render(<FeedbackModal {...defaultProps} />);

        const textarea = screen.getByPlaceholderText(
            "Provide any additional context about your feedback..."
        ) as HTMLTextAreaElement;

        fireEvent.change(textarea, { target: { value: "Great response!" } });
        expect(textarea.value).toBe("Great response!");
        expect(screen.getByText("15/1000 characters")).toBeInTheDocument();
    });

    it("enforces character limit", () => {
        render(<FeedbackModal {...defaultProps} />);

        const textarea = screen.getByPlaceholderText(
            "Provide any additional context about your feedback..."
        ) as HTMLTextAreaElement;

        const longText = "a".repeat(1001);
        fireEvent.change(textarea, { target: { value: longText } });
        // Should not update
        expect(textarea.value).toBe("");

        const boundaryText = "a".repeat(1000);
        fireEvent.change(textarea, { target: { value: boundaryText } });
        expect(textarea.value).toBe(boundaryText);
    });

    it("submits the form with comments", () => {
        render(<FeedbackModal {...defaultProps} />);

        const textarea = screen.getByPlaceholderText(
            "Provide any additional context about your feedback..."
        );
        fireEvent.change(textarea, { target: { value: "Test comment" } });

        const submitButton = screen.getByRole("button", { name: "Submit" });
        fireEvent.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalledWith("Test comment");
        // Verify comment is cleared (although component unmounts usually, we can check state if we rerender)
    });

    it("calls onSubmit with empty string when closed", () => {
        render(<FeedbackModal {...defaultProps} />);

        const closeButton = screen.getByRole("button", { name: "Close" });
        fireEvent.click(closeButton);

        expect(mockOnSubmit).toHaveBeenCalledWith("");
    });
});
