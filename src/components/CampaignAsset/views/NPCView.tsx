import React from "react";
import { Tab, Tabs } from "react-bootstrap";
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
        <Tabs
            defaultActiveKey="gm"
            className="mb-3"
            style={{
                marginLeft: "-1rem",
                marginRight: "-1rem",
            }}
        >
            <Tab eventKey="gm" title="GM Information">
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
            </Tab>

            <Tab eventKey="player" title="Player Information">
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
            </Tab>
        </Tabs>
    );
};
