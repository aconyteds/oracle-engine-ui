import { useAutoGrowTextarea } from "@hooks";
import React, { useId } from "react";
import { Form } from "react-bootstrap";
import type { AssetFormProps, NPCFormData } from "./types";

export type NPCFormProps = AssetFormProps<NPCFormData>;

/**
 * NPCForm - A controlled form component for editing NPC assets
 *
 * This component receives form data via props and reports changes upward.
 * It has NO internal state for asset data - the parent is the source of truth.
 */
export const NPCForm: React.FC<NPCFormProps> = ({
    formData,
    onChange,
    disabled = false,
}) => {
    const formId = useId();

    // Auto-grow textarea refs
    const physicalDescriptionRef = useAutoGrowTextarea(
        formData.physicalDescription,
        2
    );
    const gmSummaryRef = useAutoGrowTextarea(formData.gmSummary, 3);
    const motivationRef = useAutoGrowTextarea(formData.motivation, 2);
    const mannerismsRef = useAutoGrowTextarea(formData.mannerisms, 3);
    const gmNotesRef = useAutoGrowTextarea(formData.gmNotes, 4);
    const playerSummaryRef = useAutoGrowTextarea(formData.playerSummary, 3);
    const playerNotesRef = useAutoGrowTextarea(formData.playerNotes, 3);

    return (
        <Form className="npc-form">
            {/* Name */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-name`}>
                    Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => onChange("name", e.target.value)}
                    placeholder="Enter NPC name"
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
                    value={formData.gmSummary}
                    onChange={(e) => onChange("gmSummary", e.target.value)}
                    placeholder="Summary visible only to the GM"
                    id={`${formId}-gm-summary`}
                    style={{ overflow: "hidden", resize: "none" }}
                    maxLength={200}
                    ref={gmSummaryRef}
                    disabled={disabled}
                />
            </Form.Group>

            {/* Physical Description */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-physical-description`}>
                    Physical Description
                </Form.Label>
                <Form.Control
                    as="textarea"
                    ref={physicalDescriptionRef}
                    value={formData.physicalDescription}
                    onChange={(e) =>
                        onChange("physicalDescription", e.target.value)
                    }
                    placeholder="Describe the NPC's appearance"
                    id={`${formId}-physical-description`}
                    style={{ overflow: "hidden", resize: "none" }}
                    disabled={disabled}
                />
            </Form.Group>

            {/* Motivation */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-motivation`}>
                    Motivation
                </Form.Label>
                <Form.Control
                    as="textarea"
                    ref={motivationRef}
                    value={formData.motivation}
                    onChange={(e) => onChange("motivation", e.target.value)}
                    placeholder="What drives this NPC?"
                    id={`${formId}-motivation`}
                    style={{ overflow: "hidden", resize: "none" }}
                    disabled={disabled}
                />
            </Form.Group>

            {/* Mannerisms */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-mannerisms`}>
                    Mannerisms
                </Form.Label>
                <Form.Control
                    as="textarea"
                    ref={mannerismsRef}
                    value={formData.mannerisms}
                    onChange={(e) => onChange("mannerisms", e.target.value)}
                    placeholder="Distinctive behaviors, speech patterns, or quirks"
                    id={`${formId}-mannerisms`}
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
