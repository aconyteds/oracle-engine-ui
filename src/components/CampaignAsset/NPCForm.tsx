import { useAutoGrowTextarea } from "@hooks";
import React, { useId } from "react";
import { Form } from "react-bootstrap";
import { MarkdownTextarea } from "../Common";
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

    // Auto-grow textarea ref for gmSummary and playerSummary (with maxLength)
    const gmSummaryRef = useAutoGrowTextarea(formData.gmSummary, 3);
    const playerSummaryRef = useAutoGrowTextarea(formData.playerSummary, 3);

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
                <MarkdownTextarea
                    value={formData.physicalDescription}
                    onChange={(value) => onChange("physicalDescription", value)}
                    placeholder="Describe the NPC's appearance"
                    id={`${formId}-physical-description`}
                    disabled={disabled}
                    minRows={2}
                />
            </Form.Group>

            {/* Motivation */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-motivation`}>
                    Motivation
                </Form.Label>
                <MarkdownTextarea
                    value={formData.motivation}
                    onChange={(value) => onChange("motivation", value)}
                    placeholder="What drives this NPC?"
                    id={`${formId}-motivation`}
                    disabled={disabled}
                    minRows={2}
                />
            </Form.Group>

            {/* Mannerisms */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-mannerisms`}>
                    Mannerisms
                </Form.Label>
                <MarkdownTextarea
                    value={formData.mannerisms}
                    onChange={(value) => onChange("mannerisms", value)}
                    placeholder="Distinctive behaviors, speech patterns, or quirks"
                    id={`${formId}-mannerisms`}
                    disabled={disabled}
                    minRows={3}
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
