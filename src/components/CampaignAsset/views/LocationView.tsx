import React from "react";
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
        <div className="location-view">
            {/* Name - displayed as heading */}
            <h2 className="h4 mb-3">{formData.name || "Untitled Location"}</h2>

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
