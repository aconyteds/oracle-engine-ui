import { useAutoGrowTextarea } from "@hooks";
import React, { useId } from "react";
import { Form } from "react-bootstrap";

export interface MarkdownTextareaProps {
    /** Current value of the textarea */
    value: string;
    /** Callback when value changes */
    onChange: (value: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Minimum number of rows to display */
    minRows?: number;
    /** Maximum character length */
    maxLength?: number;
    /** Whether the textarea is disabled */
    disabled?: boolean;
    /** ID for the textarea element */
    id?: string;
    /** Optional callback for @ mention trigger (future feature) */
    onMentionTrigger?: (searchText: string) => void;
}

/**
 * MarkdownTextarea - A lightweight markdown editor component
 *
 * This component provides a textarea that auto-grows based on content
 * and is designed to support markdown input. It uses the existing
 * useAutoGrowTextarea hook for consistent behavior with other textareas.
 */
export const MarkdownTextarea: React.FC<MarkdownTextareaProps> = ({
    value,
    onChange,
    placeholder,
    minRows = 2,
    maxLength,
    disabled = false,
    id,
    onMentionTrigger,
}) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    const textareaRef = useAutoGrowTextarea(value, minRows);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        // Future: Detect @ mentions for asset linking
        if (onMentionTrigger) {
            const cursorPosition =
                e.target.selectionStart !== null ? e.target.selectionStart : 0;
            const textBeforeCursor = newValue.substring(0, cursorPosition);
            const lastAtSymbol = textBeforeCursor.lastIndexOf("@");

            if (lastAtSymbol !== -1) {
                const textAfterAt = textBeforeCursor.substring(
                    lastAtSymbol + 1
                );
                // Only trigger if there's no whitespace after @
                if (!/\s/.test(textAfterAt)) {
                    onMentionTrigger(textAfterAt);
                }
            }
        }
    };

    return (
        <Form.Control
            as="textarea"
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            id={textareaId}
            style={{ overflow: "hidden", resize: "none" }}
        />
    );
};
