import { useAutoGrowTextarea } from "@hooks";
import React, { useId } from "react";
import { Form } from "react-bootstrap";
import type { AssetFormProps, LocationFormData } from "./types";

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

    // Auto-grow textarea refs
    const gmSummaryRef = useAutoGrowTextarea(formData.gmSummary, 2);
    const descriptionRef = useAutoGrowTextarea(formData.description, 3);
    const charactersRef = useAutoGrowTextarea(formData.characters, 2);
    const pointsOfInterestRef = useAutoGrowTextarea(
        formData.pointsOfInterest,
        2
    );
    const gmNotesRef = useAutoGrowTextarea(formData.gmNotes, 4);
    const playerSummaryRef = useAutoGrowTextarea(formData.playerSummary, 2);
    const playerNotesRef = useAutoGrowTextarea(formData.playerNotes, 3);

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
                <Form.Control
                    as="textarea"
                    ref={descriptionRef}
                    value={formData.description}
                    onChange={(e) => onChange("description", e.target.value)}
                    placeholder="Detailed description"
                    id={`${formId}-description`}
                    style={{ overflow: "hidden", resize: "none" }}
                    disabled={disabled}
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
                <Form.Control
                    as="textarea"
                    ref={charactersRef}
                    value={formData.characters}
                    onChange={(e) => onChange("characters", e.target.value)}
                    placeholder="Key characters present"
                    id={`${formId}-characters`}
                    style={{ overflow: "hidden", resize: "none" }}
                    disabled={disabled}
                />
            </Form.Group>

            {/* Points of Interest */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-points-of-interest`}>
                    Points of Interest
                </Form.Label>
                <Form.Control
                    as="textarea"
                    ref={pointsOfInterestRef}
                    value={formData.pointsOfInterest}
                    onChange={(e) =>
                        onChange("pointsOfInterest", e.target.value)
                    }
                    placeholder="Notable spots within this location"
                    id={`${formId}-points-of-interest`}
                    style={{ overflow: "hidden", resize: "none" }}
                    disabled={disabled}
                />
            </Form.Group>

            {/* GM Notes */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-gm-notes`}>GM Notes</Form.Label>
                <Form.Control
                    as="textarea"
                    ref={gmNotesRef}
                    value={formData.gmNotes}
                    onChange={(e) => onChange("gmNotes", e.target.value)}
                    placeholder="GM notes (not visible to players)"
                    id={`${formId}-gm-notes`}
                    style={{ overflow: "hidden", resize: "none" }}
                    disabled={disabled}
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
                <Form.Control
                    as="textarea"
                    ref={playerNotesRef}
                    value={formData.playerNotes}
                    onChange={(e) => onChange("playerNotes", e.target.value)}
                    placeholder="Information visible to players"
                    id={`${formId}-player-notes`}
                    style={{ overflow: "hidden", resize: "none" }}
                    disabled={disabled}
                />
            </Form.Group>
        </Form>
    );
};
