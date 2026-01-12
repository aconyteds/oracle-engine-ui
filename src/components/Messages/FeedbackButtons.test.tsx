import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FeedbackButtons } from "./FeedbackButtons";
import { FeedbackModalProps } from "./FeedbackModal";

// Mock GraphQL Hook
const mockSendFeedback = vi.fn();
vi.mock("@graphql", () => ({
    useSendFeedbackMutation: () => [mockSendFeedback],
}));

// Mock Toaster
const mockToastSuccess = vi.fn();
const mockToastDanger = vi.fn();
vi.mock("@/contexts", () => ({
    useToaster: () => ({
        toast: {
            success: mockToastSuccess,
            danger: mockToastDanger,
        },
    }),
}));

// Mock Firebase
vi.mock("../firebase", () => ({
    LogEvent: vi.fn(),
}));

// Mock FeedbackModal
vi.mock("./FeedbackModal", () => ({
    FeedbackModal: ({ show, onSubmit }: FeedbackModalProps) =>
        show ? (
            <div data-testid="feedback-modal">
                <button
                    data-testid="submit-modal"
                    onClick={() => onSubmit("test comment")}
                >
                    Submit Modal
                </button>
            </div>
        ) : null,
}));

describe("FeedbackButtons Component", () => {
    const defaultProps = {
        messageId: "123",
        messageContent: "Test content",
    };

    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders thumbs up and thumbs down buttons", () => {
        render(<FeedbackButtons {...defaultProps} />);
        expect(screen.getByTestId("fa-icon-thumbs-up")).toBeInTheDocument();
        expect(screen.getByTestId("fa-icon-thumbs-down")).toBeInTheDocument();
    });

    it("opens modal when thumbs up is clicked", () => {
        render(<FeedbackButtons {...defaultProps} />);
        const thumbsUp = screen.getByTestId("fa-icon-thumbs-up");
        fireEvent.click(thumbsUp);
        expect(screen.getByTestId("feedback-modal")).toBeInTheDocument();
    });

    it("opens modal when thumbs down is clicked", () => {
        render(<FeedbackButtons {...defaultProps} />);
        const thumbsDown = screen.getByTestId("fa-icon-thumbs-down");
        fireEvent.click(thumbsDown);
        expect(screen.getByTestId("feedback-modal")).toBeInTheDocument();
    });

    it("submits feedback successfully", async () => {
        // Mock successful mutation
        mockSendFeedback.mockResolvedValue({});

        render(<FeedbackButtons {...defaultProps} />);

        // Open modal
        fireEvent.click(screen.getByTestId("fa-icon-thumbs-up"));

        // Submit modal
        fireEvent.click(screen.getByTestId("submit-modal"));

        // Expect mutation to be called
        expect(mockSendFeedback).toHaveBeenCalledWith({
            variables: {
                input: {
                    messageId: "123",
                    humanSentiment: true,
                    comments: "test comment",
                },
            },
        });

        // Expect success toast
        // Wait for async operations
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(mockToastSuccess).toHaveBeenCalledWith({
            message: "Thank you for your feedback!",
        });
    });

    it("handles feedback submission error", async () => {
        // Mock failed mutation
        mockSendFeedback.mockRejectedValue(new Error("Network error"));

        // Console error mock to suppress output
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
            return;
        });

        render(<FeedbackButtons {...defaultProps} />);

        fireEvent.click(screen.getByTestId("fa-icon-thumbs-up"));
        fireEvent.click(screen.getByTestId("submit-modal"));

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockToastDanger).toHaveBeenCalledWith({
            message: "Failed to submit feedback. Please try again.",
        });

        consoleSpy.mockRestore();
    });

    it("renders existing sentiment if provided", () => {
        render(<FeedbackButtons {...defaultProps} currentSentiment={true} />);

        // Should only show one icon (thumbs-up mock logic in component might vary, checking logic)
        // The component renders a specific icon if currentSentiment is not null
        // And importantly, does NOT render the clickable ones

        // Based on implementation:
        // if (localSentiment !== null) ... returns specific icon

        // FaIcon mock uses icon.iconName.
        // faThumbsUp solid is 'thumbs-up'
        // faThumbsDown solid is 'thumbs-down'

        // Note: Check what the Regular vs Solid icon names are in FA.
        // Usually 'thumbs-up' is shared, so we might need to differentiate by class or specific prop if needed.
        // But for this test, checking existence and absent of interaction is key.

        expect(screen.getByTestId("fa-icon-thumbs-up")).toBeInTheDocument();
        // The clickable ones are Regular icons, the result is Solid.
        // Our mock doesn't distinguish, but the DOM structure is different (single icon vs flex container).

        // Let's assume the mock renders identifiable attributes or we check structure.
        // Actually, checking that we can't click to open modal is a good test.
        fireEvent.click(screen.getByTestId("fa-icon-thumbs-up"));
        expect(screen.queryByTestId("feedback-modal")).not.toBeInTheDocument();
    });
});
