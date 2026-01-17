import { useAutoGrowTextarea } from "@hooks";
import React, { useId } from "react";
import { Form } from "react-bootstrap";
import { MarkdownTextarea } from "../../Common";
import type { AssetFormProps, LocationFormData } from "../types";

export type LocationFormProps = AssetFormProps<LocationFormData>;

/**
 * LocationForm - A controlled form component for editing Location assets
 *
 * This component receives form data via props and reports changes upward.
 * It has NO internal state for asset data - the parent is the source of truth.
 */
export const LocationForm: React.FC<LocationFormProps> = ({
    formData,
    onChange,
    disabled = false,
}) => {
    const formId = useId();

    // Auto-grow textarea refs for gmSummary and playerSummary (with maxLength)
    const gmSummaryRef = useAutoGrowTextarea(formData.gmSummary, 2);
    const playerSummaryRef = useAutoGrowTextarea(formData.playerSummary, 2);

    return (
        <Form className="location-form">
            {/* Name */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-name`}>
                    Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => onChange("name", e.target.value)}
                    placeholder="Enter location name"
                    required
                    isInvalid={!formData.name}
                    id={`${formId}-name`}
                    disabled={disabled}
                />
                <Form.Control.Feedback type="invalid">
                    Name is required
                </Form.Control.Feedback>
            </Form.Group>

            {/* GM Summary */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-gm-summary`}>
                    GM Summary
                </Form.Label>
                <Form.Control
                    as="textarea"
                    ref={gmSummaryRef}
                    value={formData.gmSummary}
                    onChange={(e) => onChange("gmSummary", e.target.value)}
                    placeholder="Brief summary of the location"
                    id={`${formId}-gm-summary`}
                    style={{ overflow: "hidden", resize: "none" }}
                    disabled={disabled}
                    maxLength={200}
                />
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-description`}>
                    Description
                </Form.Label>
                <MarkdownTextarea
                    value={formData.description}
                    onChange={(value) => onChange("description", value)}
                    placeholder="Detailed description"
                    id={`${formId}-description`}
                    disabled={disabled}
                    minRows={3}
                />
            </Form.Group>

            {/* Condition */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-condition`}>
                    Condition
                </Form.Label>
                <Form.Control
                    type="text"
                    value={formData.condition}
                    onChange={(e) => onChange("condition", e.target.value)}
                    placeholder="Current condition (e.g. Ruined, Bustling)"
                    id={`${formId}-condition`}
                    disabled={disabled}
                />
            </Form.Group>

            {/* Characters */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-characters`}>
                    Characters
                </Form.Label>
                <MarkdownTextarea
                    value={formData.characters}
                    onChange={(value) => onChange("characters", value)}
                    placeholder="Key characters present"
                    id={`${formId}-characters`}
                    disabled={disabled}
                    minRows={2}
                />
            </Form.Group>

            {/* Points of Interest */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-points-of-interest`}>
                    Points of Interest
                </Form.Label>
                <MarkdownTextarea
                    value={formData.pointsOfInterest}
                    onChange={(value) => onChange("pointsOfInterest", value)}
                    placeholder="Notable spots within this location"
                    id={`${formId}-points-of-interest`}
                    disabled={disabled}
                    minRows={2}
                />
            </Form.Group>

            {/* GM Notes */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-gm-notes`}>GM Notes</Form.Label>
                <MarkdownTextarea
                    value={formData.gmNotes}
                    onChange={(value) => onChange("gmNotes", value)}
                    placeholder="GM notes (not visible to players)"
                    id={`${formId}-gm-notes`}
                    disabled={disabled}
                    minRows={4}
                />
            </Form.Group>

            {/* Shared with Players */}
            {/* Player Summary */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-player-summary`}>
                    Player Summary (Shared)
                </Form.Label>
                <Form.Control
                    as="textarea"
                    value={formData.playerSummary}
                    onChange={(e) => onChange("playerSummary", e.target.value)}
                    placeholder="Summary visible to players"
                    id={`${formId}-player-summary`}
                    style={{ overflow: "hidden", resize: "none" }}
                    maxLength={200}
                    disabled={disabled}
                    ref={playerSummaryRef}
                />
            </Form.Group>
            {/* Player Notes */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-player-notes`}>
                    Player Notes (Shared)
                </Form.Label>
                <MarkdownTextarea
                    value={formData.playerNotes}
                    onChange={(value) => onChange("playerNotes", value)}
                    placeholder="Information visible to players"
                    id={`${formId}-player-notes`}
                    disabled={disabled}
                    minRows={3}
                />
            </Form.Group>
        </Form>
    );
};
