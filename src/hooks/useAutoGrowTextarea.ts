import { useEffect, useRef } from "react";

/**
 * Hook to make textareas automatically grow/shrink based on content
 * @param value - The current value of the textarea (to trigger resize on value changes)
 * @param minRows - Minimum number of rows to display (default: 2)
 * @returns ref to attach to the textarea element
 */
export const useAutoGrowTextarea = <T extends HTMLTextAreaElement>(
    value: string,
    minRows: number = 2
) => {
    const textareaRef = useRef<T>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: We need value in dependencies to trigger resize on content changes
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = "auto";

        // Calculate the height based on content
        const scrollHeight = textarea.scrollHeight;

        // Calculate minimum height based on minRows
        const lineHeight = parseInt(
            window.getComputedStyle(textarea).lineHeight
        );
        const paddingTop = parseInt(
            window.getComputedStyle(textarea).paddingTop
        );
        const paddingBottom = parseInt(
            window.getComputedStyle(textarea).paddingBottom
        );
        const borderTop = parseInt(
            window.getComputedStyle(textarea).borderTopWidth
        );
        const borderBottom = parseInt(
            window.getComputedStyle(textarea).borderBottomWidth
        );

        const minHeight =
            lineHeight * minRows +
            paddingTop +
            paddingBottom +
            borderTop +
            borderBottom;

        // Set the height to the larger of scrollHeight or minHeight
        textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;
    }, [value, minRows]);

    return textareaRef;
};
