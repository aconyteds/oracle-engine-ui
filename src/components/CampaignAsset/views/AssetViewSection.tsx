import React from "react";
import { MarkdownRenderer } from "../../Common";

export interface AssetViewSectionProps {
    /** Label for the section */
    label: string;
    /** Content to render (markdown) */
    content: string;
    /** Optional wrapper type */
    wrapper?: "blockquote" | null;
    /** Text to display when content is empty */
    emptyText?: string;
}

/**
 * AssetViewSection - Reusable component for rendering labeled sections in view mode
 *
 * This component displays a label and renders markdown content using MarkdownRenderer.
 * It handles empty content gracefully and optionally wraps content in a blockquote.
 */
export const AssetViewSection: React.FC<AssetViewSectionProps> = ({
    label,
    content,
    wrapper = null,
    emptyText = "No information provided",
}) => {
    const isEmpty = !content || content.trim() === "";

    return (
        <div className="mb-3">
            <h4 className="d-block mb-2">{label}</h4>
            {isEmpty ? (
                <p className="text-muted fst-italic">{emptyText}</p>
            ) : wrapper === "blockquote" ? (
                <MarkdownRenderer
                    content={` \`\`\`Read_Aloud\n${content}\n\`\`\``}
                />
            ) : (
                <MarkdownRenderer content={content} />
            )}
        </div>
    );
};
