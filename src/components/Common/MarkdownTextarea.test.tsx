import "@testing-library/jest-dom";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { MarkdownTextarea } from "./MarkdownTextarea";

describe("MarkdownTextarea Component", () => {
    afterEach(() => {
        cleanup();
    });

    test("should render textarea with value", () => {
        const mockOnChange = vi.fn();
        render(
            <MarkdownTextarea value="Test content" onChange={mockOnChange} />
        );

        const textarea = screen.getByDisplayValue(
            "Test content"
        ) as HTMLTextAreaElement;
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

    test("should respect maxLength prop", () => {
        const mockOnChange = vi.fn();
        render(
            <MarkdownTextarea
                value=""
                onChange={mockOnChange}
                maxLength={100}
            />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        expect(textarea.maxLength).toBe(100);
    });

    test("should use provided id", () => {
        const mockOnChange = vi.fn();
        render(
            <MarkdownTextarea value="" onChange={mockOnChange} id="custom-id" />
        );

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        expect(textarea.id).toBe("custom-id");
    });

    test("should have resize:none and overflow:hidden styles", () => {
        const mockOnChange = vi.fn();
        render(<MarkdownTextarea value="" onChange={mockOnChange} />);

        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
        expect(textarea.style.resize).toBe("none");
        expect(textarea.style.overflow).toBe("hidden");
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
});
