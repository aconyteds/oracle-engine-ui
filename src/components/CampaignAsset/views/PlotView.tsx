import React from "react";
import { Badge, Tab, Tabs } from "react-bootstrap";
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
