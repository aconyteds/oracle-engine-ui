import { useTheme } from "@hooks";
import MDEditor, { commands, type PreviewType } from "@uiw/react-md-editor";
import React, { useId, useMemo, useState } from "react";
import "./MarkdownTextarea.scss";

export interface MarkdownTextareaProps {
    /** Current value of the textarea */
    value: string;
    /** Callback when value changes */
    onChange: (value: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Minimum number of rows to display */
    minRows?: number;
    /** Maximum character length (enforced via onChange) */
    maxLength?: number;
    /** Whether the textarea is disabled */
    disabled?: boolean;
    /** ID for the textarea element */
    id?: string;
    /** Optional callback for @ mention trigger (future feature) */
    onMentionTrigger?: (searchText: string) => void;
}

// Basic toolbar commands for formatting
const basicCommands = [
    commands.bold,
    commands.italic,
    commands.strikethrough,
    commands.divider,
    commands.heading,
    commands.divider,
    commands.quote,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.divider,
    commands.link,
];

/**
 * MarkdownTextarea - A markdown editor component with formatting toolbar
 *
 * This component provides a rich markdown editing experience using @uiw/react-md-editor.
 * It supports basic formatting (bold, italic, headings, lists, links, quotes) and
 * integrates with the application's theme system.
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
    const { theme } = useTheme();

    // Track fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Track preview mode - reset to "edit" when exiting fullscreen
    const [previewMode, setPreviewMode] = useState<PreviewType>("edit");

    // Convert minRows to approximate pixel height (24px per row)
    const minHeight = minRows * 24;

    // Create a custom fullscreen command that tracks state
    const customFullscreen: commands.ICommand = useMemo(
        () => ({
            ...commands.fullscreen,
            execute: (state, api) => {
                // Toggle fullscreen state
                setIsFullscreen((prev) => {
                    const newIsFullscreen = !prev;
                    // Reset preview mode to "edit" when exiting fullscreen
                    if (!newIsFullscreen) {
                        setPreviewMode("edit");
                    }
                    return newIsFullscreen;
                });
                // Call original execute if it exists
                if (commands.fullscreen.execute) {
                    commands.fullscreen.execute(state, api);
                }
            },
        }),
        []
    );

    // Create custom preview commands that update our controlled state
    const customCodeEdit: commands.ICommand = useMemo(
        () => ({
            ...commands.codeEdit,
            execute: () => setPreviewMode("edit"),
        }),
        []
    );

    const customCodeLive: commands.ICommand = useMemo(
        () => ({
            ...commands.codeLive,
            execute: () => setPreviewMode("live"),
        }),
        []
    );

    const customCodePreview: commands.ICommand = useMemo(
        () => ({
            ...commands.codePreview,
            execute: () => setPreviewMode("preview"),
        }),
        []
    );

    // Build extra commands - only show preview toggle in fullscreen mode
    const extraCommands: commands.ICommand[] = useMemo(
        () =>
            isFullscreen
                ? [
                      customCodeEdit,
                      customCodeLive,
                      customCodePreview,
                      commands.divider,
                      customFullscreen,
                  ]
                : [customFullscreen],
        [
            isFullscreen,
            customFullscreen,
            customCodeEdit,
            customCodeLive,
            customCodePreview,
        ]
    );

    const handleChange = (newValue?: string) => {
        const val = newValue || "";

        // Enforce maxLength if specified
        if (maxLength && val.length > maxLength) {
            onChange(val.substring(0, maxLength));
            return;
        }

        onChange(val);

        // Future: Detect @ mentions for asset linking
        if (onMentionTrigger && val.includes("@")) {
            // Find the last @ symbol and text after it
            const lastAtIndex = val.lastIndexOf("@");
            if (lastAtIndex !== -1) {
                const textAfterAt = val.substring(lastAtIndex + 1);
                // Only trigger if there's no whitespace after @
                const match = textAfterAt.match(/^[^\s]*/);
                if (match && match[0]) {
                    onMentionTrigger(match[0]);
                }
            }
        }
    };

    return (
        <div
            data-color-mode={theme}
            className={`form-control p-0 border-0 markdown-textarea-wrapper${disabled ? " md-editor-disabled" : ""}`}
        >
            <MDEditor
                value={value}
                onChange={handleChange}
                preview={previewMode}
                commands={basicCommands}
                extraCommands={extraCommands}
                visibleDragbar={false}
                minHeight={minHeight}
                textareaProps={{
                    placeholder,
                    disabled,
                    id: textareaId,
                }}
            />
        </div>
    );
};
