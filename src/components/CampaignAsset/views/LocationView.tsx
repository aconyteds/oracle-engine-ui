import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import type { AssetViewProps, LocationFormData } from "../types";
import { AssetViewSection } from "./AssetViewSection";

export type LocationViewProps = AssetViewProps<LocationFormData>;

/**
 * LocationView - Read-only view component for Location assets
 *
 * This component displays Location data in a formatted, read-only view
 * using markdown rendering for rich text content.
 */
export const LocationView: React.FC<LocationViewProps> = ({ formData }) => {
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

                {/* Description - with blockquote wrapper */}
                <AssetViewSection
                    label="Description"
                    content={formData.description}
                    wrapper="blockquote"
                    emptyText="No description provided"
                />

                {/* Condition - inline text */}
                {formData.condition && (
                    <div className="mb-3">
                        <strong className="d-block mb-2">Condition</strong>
                        <p className="mb-0">{formData.condition}</p>
                    </div>
                )}

                {/* Characters */}
                <AssetViewSection
                    label="Characters"
                    content={formData.characters}
                    emptyText="No characters listed"
                />

                {/* Points of Interest */}
                <AssetViewSection
                    label="Points of Interest"
                    content={formData.pointsOfInterest}
                    emptyText="No points of interest listed"
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
