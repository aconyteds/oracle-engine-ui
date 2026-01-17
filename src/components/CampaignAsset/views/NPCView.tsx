import React from "react";
import type { AssetViewProps, NPCFormData } from "../types";
import { AssetViewSection } from "./AssetViewSection";

export type NPCViewProps = AssetViewProps<NPCFormData>;

/**
 * NPCView - Read-only view component for NPC assets
 *
 * This component displays NPC data in a formatted, read-only view
 * using markdown rendering for rich text content.
 */
export const NPCView: React.FC<NPCViewProps> = ({ formData }) => {
    return (
        <div className="npc-view">
            {/* Name - displayed as heading */}
            <h2 className="h4 mb-3">{formData.name || "Untitled NPC"}</h2>

            {/* GM Summary */}
            <AssetViewSection
                label="GM Summary"
                content={formData.gmSummary}
                emptyText="No GM summary provided"
            />

            {/* Physical Description - with blockquote wrapper */}
            <AssetViewSection
                label="Physical Description"
                content={formData.physicalDescription}
                wrapper="blockquote"
                emptyText="No physical description provided"
            />

            {/* Motivation */}
            <AssetViewSection
                label="Motivation"
                content={formData.motivation}
                emptyText="No motivation provided"
            />

            {/* Mannerisms */}
            <AssetViewSection
                label="Mannerisms"
                content={formData.mannerisms}
                emptyText="No mannerisms provided"
            />

            {/* GM Notes */}
            <AssetViewSection
                label="GM Notes"
                content={formData.gmNotes}
                emptyText="No GM notes"
            />

            {/* Shared with Players */}
            <hr className="my-4" />
            <h3 className="h5 mb-3">Shared with Players</h3>

            {/* Player Summary */}
            <AssetViewSection
                label="Player Summary"
                content={formData.playerSummary}
                emptyText="No player summary provided"
            />

            {/* Player Notes */}
            <AssetViewSection
                label="Player Notes"
                content={formData.playerNotes}
                emptyText="No player notes"
            />
        </div>
    );
};
