import { PlotStatus, Urgency } from "@graphql";
import { useAutoGrowTextarea } from "@hooks";
import React, { useId } from "react";
import { Form } from "react-bootstrap";
import { MarkdownTextarea } from "../../Common";
import { PLOT_STATUS_OPTIONS, URGENCY_OPTIONS } from "../plotUtils";
import type { AssetFormProps, PlotFormData } from "../types";

export type PlotFormProps = AssetFormProps<PlotFormData>;

/**
 * PlotForm - A controlled form component for editing Plot assets
 *
 * This component receives form data via props and reports changes upward.
 * It has NO internal state for asset data - the parent is the source of truth.
 */
export const PlotForm: React.FC<PlotFormProps> = ({
    formData,
    onChange,
    disabled = false,
}) => {
    const formId = useId();

    // Auto-grow textarea refs for gmSummary and playerSummary (with maxLength)
    const gmSummaryRef = useAutoGrowTextarea(formData.gmSummary, 2);
    const playerSummaryRef = useAutoGrowTextarea(formData.playerSummary, 2);

    return (
        <Form className="plot-form">
            {/* Name */}
            <Form.Group className="mb-3">
                <Form.Label htmlFor={`${formId}-name`}>
                    Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => onChange("name", e.target.value)}
                    placeholder="Enter plot name"
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
                    placeholder="Brief description of the plot"
                    id={`${formId}-gm-summary`}
                    style={{ overflow: "hidden", resize: "none" }}
                    disabled={disabled}
                    maxLength={200}
                />
            </Form.Group>

            {/* Status and Urgency */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <Form.Group>
                        <Form.Label htmlFor={`${formId}-status`}>
                            Status
                        </Form.Label>
                        <Form.Select
                            id={`${formId}-status`}
                            value={formData.status}
                            onChange={(e) =>
                                onChange("status", e.target.value as PlotStatus)
                            }
                            disabled={disabled}
                        >
                            {PLOT_STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
                <div className="col-md-6">
                    <Form.Group>
                        <Form.Label htmlFor={`${formId}-urgency`}>
                            Urgency
                        </Form.Label>
                        <Form.Select
                            id={`${formId}-urgency`}
                            value={formData.urgency}
                            onChange={(e) =>
                                onChange("urgency", e.target.value as Urgency)
                            }
                            disabled={disabled}
                        >
                            {URGENCY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
            </div>

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
