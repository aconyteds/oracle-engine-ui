import { PlotStatus, Urgency } from "@graphql";
import React from "react";
import { Badge } from "react-bootstrap";
import type { AssetViewProps, PlotFormData } from "../types";
import { AssetViewSection } from "./AssetViewSection";

export type PlotViewProps = AssetViewProps<PlotFormData>;

// Helper to get badge variant based on status
const getStatusVariant = (status: PlotStatus): string => {
    switch (status) {
        case PlotStatus.Closed:
            return "success";
        case PlotStatus.InProgress:
            return "primary";
        case PlotStatus.WillNotDo:
            return "secondary";
        case PlotStatus.Rumored:
            return "info";
        case PlotStatus.Unknown:
        default:
            return "secondary";
    }
};

// Helper to get badge variant based on urgency
const getUrgencyVariant = (urgency: Urgency): string => {
    switch (urgency) {
        case Urgency.Critical:
            return "danger";
        case Urgency.Ongoing:
            return "warning";
        case Urgency.Resolved:
            return "success";
        default:
            return "secondary";
    }
};

// Helper to format status for display
const formatStatus = (status: PlotStatus): string => {
    switch (status) {
        case PlotStatus.Closed:
            return "Completed";
        case PlotStatus.InProgress:
            return "In Progress";
        case PlotStatus.WillNotDo:
            return "Will Not Do";
        case PlotStatus.Rumored:
            return "Rumored";
        case PlotStatus.Unknown:
        default:
            return "Unknown";
    }
};

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
                    <Badge bg={getStatusVariant(formData.status)}>
                        {formatStatus(formData.status)}
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
