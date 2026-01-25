import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "../../test-utils";
import { suppressConsole } from "../../test-utils/consoleUtils";
import { AppFeedbackModal } from "./AppFeedbackModal";

// Mock GraphQL mutation
const mockSendAppFeedback = vi.fn();
vi.mock("@graphql", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@graphql")>();
    return {
        ...actual,
        useSendAppFeedbackMutation: () => [
            mockSendAppFeedback,
            { loading: false },
        ],
    };
});

describe("AppFeedbackModal", () => {
    const mockOnHide = vi.fn();
    const defaultProps = {
        show: true,
        onHide: mockOnHide,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockSendAppFeedback.mockResolvedValue({
            data: { sendFeedback: { success: true } },
        });
    });

    afterEach(() => {
        cleanup();
    });

    describe("rendering", () => {
        test("renders correctly when shown", () => {
            render(<AppFeedbackModal {...defaultProps} />);

            expect(screen.getByText("Send Feedback")).toBeInTheDocument();
            expect(
                screen.getByText("How can we improve Oracle Engine?")
            ).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText(
                    "Share your thoughts, suggestions, or report issues..."
                )
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "Submit" })
            ).toBeInTheDocument();
        });

        test("does not render when show is false", () => {
            render(<AppFeedbackModal {...defaultProps} show={false} />);

            expect(screen.queryByText("Send Feedback")).not.toBeInTheDocument();
        });

        test("displays character count", () => {
            render(<AppFeedbackModal {...defaultProps} />);

            expect(screen.getByText("0/1000 characters")).toBeInTheDocument();
        });
    });

    describe("input handling", () => {
        test("handles feedback input changes", () => {
            render(<AppFeedbackModal {...defaultProps} />);

            const textarea = screen.getByPlaceholderText(
                "Share your thoughts, suggestions, or report issues..."
            ) as HTMLTextAreaElement;

            fireEvent.change(textarea, {
                target: { value: "Great application!" },
            });

            expect(textarea.value).toBe("Great application!");
            expect(screen.getByText("18/1000 characters")).toBeInTheDocument();
        });

        test("enforces 1000 character limit", () => {
            render(<AppFeedbackModal {...defaultProps} />);

            const textarea = screen.getByPlaceholderText(
                "Share your thoughts, suggestions, or report issues..."
            ) as HTMLTextAreaElement;

            const longText = "a".repeat(1001);
            fireEvent.change(textarea, { target: { value: longText } });
            expect(textarea.value).toBe("");

            const boundaryText = "a".repeat(1000);
            fireEvent.change(textarea, { target: { value: boundaryText } });
            expect(textarea.value).toBe(boundaryText);
            expect(
                screen.getByText("1000/1000 characters")
            ).toBeInTheDocument();
        });
    });

    describe("submit button state", () => {
        test("submit button is disabled when feedback is empty", () => {
            render(<AppFeedbackModal {...defaultProps} />);

            const submitButton = screen.getByRole("button", { name: "Submit" });
            expect(submitButton).toBeDisabled();
        });

        test("submit button is disabled when feedback is only whitespace", () => {
            render(<AppFeedbackModal {...defaultProps} />);

            const textarea = screen.getByPlaceholderText(
                "Share your thoughts, suggestions, or report issues..."
            );
            fireEvent.change(textarea, { target: { value: "   " } });

            const submitButton = screen.getByRole("button", { name: "Submit" });
            expect(submitButton).toBeDisabled();
        });

        test("submit button is enabled when feedback has content", () => {
            render(<AppFeedbackModal {...defaultProps} />);

            const textarea = screen.getByPlaceholderText(
                "Share your thoughts, suggestions, or report issues..."
            );
            fireEvent.change(textarea, { target: { value: "Some feedback" } });

            const submitButton = screen.getByRole("button", { name: "Submit" });
            expect(submitButton).not.toBeDisabled();
        });
    });

    describe("form submission", () => {
        test("submits feedback successfully and shows success toast", async () => {
            render(<AppFeedbackModal {...defaultProps} />);

            const textarea = screen.getByPlaceholderText(
                "Share your thoughts, suggestions, or report issues..."
            );
            fireEvent.change(textarea, { target: { value: "Test feedback" } });

            const submitButton = screen.getByRole("button", { name: "Submit" });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSendAppFeedback).toHaveBeenCalledWith({
                    variables: {
                        input: {
                            message: "Test feedback",
                        },
                    },
                });
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Thank you for your feedback!")
                ).toBeInTheDocument();
            });
            expect(mockOnHide).toHaveBeenCalled();
        });

        test("shows error toast on submission failure", async () => {
            const { restore } = suppressConsole("error");
            mockSendAppFeedback.mockRejectedValueOnce(
                new Error("Network error")
            );

            render(<AppFeedbackModal {...defaultProps} />);

            const textarea = screen.getByPlaceholderText(
                "Share your thoughts, suggestions, or report issues..."
            );
            fireEvent.change(textarea, { target: { value: "Test feedback" } });

            const submitButton = screen.getByRole("button", { name: "Submit" });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText(
                        "Failed to submit feedback. Please try again."
                    )
                ).toBeInTheDocument();
            });

            expect(mockOnHide).not.toHaveBeenCalled();
            restore();
        });
    });

    describe("modal close behavior", () => {
        test("clears input and calls onHide when close button is clicked", () => {
            render(<AppFeedbackModal {...defaultProps} />);

            const textarea = screen.getByPlaceholderText(
                "Share your thoughts, suggestions, or report issues..."
            ) as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: "Some text" } });

            const closeButton = screen.getByRole("button", { name: "Close" });
            fireEvent.click(closeButton);

            expect(mockOnHide).toHaveBeenCalled();
        });
    });
});
