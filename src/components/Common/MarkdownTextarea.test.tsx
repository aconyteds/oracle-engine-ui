import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { MarkdownTextarea } from "./MarkdownTextarea";

describe("MarkdownTextarea Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    test("should render with value", () => {
        const mockOnChange = vi.fn();
        render(
            <MarkdownTextarea value="Test content" onChange={mockOnChange} />
        );

        // MDEditor renders the value in a textarea
        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        expect(textarea).toBeInTheDocument();
        expect(textarea.value).toBe("Test content");
    });

    test("should call onChange when value changes", () => {
        const mockOnChange = vi.fn();
        render(<MarkdownTextarea value="" onChange={mockOnChange} />);

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: "New content" } });

        expect(mockOnChange).toHaveBeenCalledWith("New content");
    });

    test("should render with placeholder", () => {
        const mockOnChange = vi.fn();
        render(
            <MarkdownTextarea
                value=""
                onChange={mockOnChange}
                placeholder="Enter markdown"
            />
        );

        const textarea = screen.getByPlaceholderText("Enter markdown");
        expect(textarea).toBeInTheDocument();
    });

    test("should disable textarea when disabled prop is true", () => {
        const mockOnChange = vi.fn();
        render(
            <MarkdownTextarea
                value=""
                onChange={mockOnChange}
                disabled={true}
            />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        expect(textarea).toBeDisabled();
    });

    test("should enable textarea when disabled prop is false", () => {
        const mockOnChange = vi.fn();
        render(
            <MarkdownTextarea
                value=""
                onChange={mockOnChange}
                disabled={false}
            />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        expect(textarea).not.toBeDisabled();
    });

    test("should apply disabled class to wrapper when disabled", () => {
        const mockOnChange = vi.fn();
        const { container } = render(
            <MarkdownTextarea
                value=""
                onChange={mockOnChange}
                disabled={true}
            />
        );

        const wrapper = container.querySelector(".markdown-textarea-wrapper");
        expect(wrapper).toHaveClass("md-editor-disabled");
    });

    test("should enforce maxLength via onChange", () => {
        const mockOnChange = vi.fn();
        render(
            <MarkdownTextarea value="" onChange={mockOnChange} maxLength={10} />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        fireEvent.change(textarea, {
            target: { value: "This is way too long" },
        });

        // Should truncate to maxLength
        expect(mockOnChange).toHaveBeenCalledWith("This is wa");
    });

    test("should use provided id", () => {
        const mockOnChange = vi.fn();
        render(
            <MarkdownTextarea value="" onChange={mockOnChange} id="custom-id" />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        expect(textarea.id).toBe("custom-id");
    });

    test("should set data-color-mode attribute based on theme", () => {
        const mockOnChange = vi.fn();
        const { container } = render(
            <MarkdownTextarea value="" onChange={mockOnChange} />
        );

        const wrapper = container.querySelector(".markdown-textarea-wrapper");
        expect(wrapper).toHaveAttribute("data-color-mode", "light");
    });

    test("should trigger onMentionTrigger when @ is typed", () => {
        const mockOnChange = vi.fn();
        const mockOnMentionTrigger = vi.fn();
        render(
            <MarkdownTextarea
                value=""
                onChange={mockOnChange}
                onMentionTrigger={mockOnMentionTrigger}
            />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

        // Simulate typing "@test"
        fireEvent.change(textarea, { target: { value: "@test" } });

        expect(mockOnChange).toHaveBeenCalledWith("@test");
        expect(mockOnMentionTrigger).toHaveBeenCalledWith("test");
    });

    test("should not trigger onMentionTrigger when @ has whitespace after it", () => {
        const mockOnChange = vi.fn();
        const mockOnMentionTrigger = vi.fn();
        render(
            <MarkdownTextarea
                value=""
                onChange={mockOnChange}
                onMentionTrigger={mockOnMentionTrigger}
            />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

        // Simulate typing "@ test" (with space after @)
        fireEvent.change(textarea, { target: { value: "@ test" } });

        expect(mockOnChange).toHaveBeenCalledWith("@ test");
        // Should not trigger mention because there's whitespace after @
        expect(mockOnMentionTrigger).not.toHaveBeenCalled();
    });

    test("should work without onMentionTrigger prop", () => {
        const mockOnChange = vi.fn();
        render(<MarkdownTextarea value="" onChange={mockOnChange} />);

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

        // Should not throw error when typing @ without onMentionTrigger
        expect(() => {
            fireEvent.change(textarea, { target: { value: "@test" } });
        }).not.toThrow();

        expect(mockOnChange).toHaveBeenCalledWith("@test");
    });

    test("should render toolbar", () => {
        const mockOnChange = vi.fn();
        const { container } = render(
            <MarkdownTextarea value="" onChange={mockOnChange} />
        );

        // MDEditor renders a toolbar
        const toolbar = container.querySelector(".w-md-editor-toolbar");
        expect(toolbar).toBeInTheDocument();
    });
});
