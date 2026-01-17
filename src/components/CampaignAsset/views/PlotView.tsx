import React from "react";
import { Badge } from "react-bootstrap";
import {
    formatPlotStatus,
    getPlotStatusVariant,
    getUrgencyVariant,
} from "../plotUtils";
import type { AssetViewProps, PlotFormData } from "../types";
import { AssetViewSection } from "./AssetViewSection";

export type PlotViewProps = AssetViewProps<PlotFormData>;

/**
 * PlotView - Read-only view component for Plot assets
 *
 * This component displays Plot data in a formatted, read-only view
 * using markdown rendering for rich text content and badges for status/urgency.
 */
export const PlotView: React.FC<PlotViewProps> = ({ formData }) => {
    return (
        <div className="plot-view">
            {/* Name - displayed as heading */}
            <h2 className="h4 mb-3">{formData.name || "Untitled Plot"}</h2>

            {/* GM Summary */}
            <AssetViewSection
                label="GM Summary"
                content={formData.gmSummary}
                emptyText="No GM summary provided"
            />

            {/* Status and Urgency - displayed as badges */}
            <div className="mb-3">
                <strong className="d-block mb-2">Status & Urgency</strong>
                <div className="d-flex gap-2">
                    <Badge bg={getPlotStatusVariant(formData.status)}>
                        {formatPlotStatus(formData.status)}
                    </Badge>
                    <Badge bg={getUrgencyVariant(formData.urgency)}>
                        {formData.urgency}
                    </Badge>
                </div>
            </div>

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
