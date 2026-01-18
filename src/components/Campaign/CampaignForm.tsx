import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { RelevantCampaignDetailsFragment } from "@graphql";
import {
    useCreateCampaignMutation,
    useDeleteCampaignMutation,
    useUpdateCampaignMutation,
    useValidateCampaignNameQuery,
    ValidateCampaignNameQueryVariables,
} from "@graphql";
import { useCampaignLimit } from "@hooks";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Form, OverlayTrigger, Popover } from "react-bootstrap";
import { useToaster } from "../../contexts/Toaster.context";
import { HoldConfirmButton } from "../Common";

// Hardcoded ruleset options
export const RULESET_OPTIONS = [
    "Masks",
    "Hunter: The Reckoning",
    "Vampire: The Masquerade",
    "Werewolf: The Apocalypse",
    "Mage: The Ascension",
    "D&D 5e",
    "Pathfinder",
    "Custom",
];

type CampaignFormProps = {
    campaign?: RelevantCampaignDetailsFragment | null;
    onSuccess: (campaign: RelevantCampaignDetailsFragment) => void;
    onDelete?: () => void;
    showDelete?: boolean;
    submitButtonText?: string;
    submitButtonClassName?: string;
};

export const CampaignForm: React.FC<CampaignFormProps> = ({
    campaign,
    onSuccess,
    onDelete,
    showDelete = false,
    submitButtonText,
    submitButtonClassName = "w-100",
}) => {
    const { toast } = useToaster();
    const isEditMode = !!campaign;

    const [formData, setFormData] = useState({
        name: "",
        setting: "",
        tone: "",
        ruleset: "",
    });
    const [debouncedName, setDebouncedName] = useState("");
    const [nameError, setNameError] = useState<string | null>(null);

    const { canCreate, limitMessage } = useCampaignLimit();
    const [createCampaign, { loading: creating }] = useCreateCampaignMutation();
    const [updateCampaign, { loading: updating }] = useUpdateCampaignMutation();
    const [deleteCampaign, { loading: deleting }] = useDeleteCampaignMutation();

    // Debounce the name input for validation (500ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedName(formData.name);
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.name]);

    // Build validation input, skip validation if name is empty or unchanged
    const validateNameInput = useMemo<
        ValidateCampaignNameQueryVariables | undefined
    >(() => {
        if (!debouncedName || debouncedName === campaign?.name) {
            return undefined;
        }
        return {
            input: { name: debouncedName },
        };
    }, [debouncedName, campaign?.name]);

    const { data: validationData, loading: validating } =
        useValidateCampaignNameQuery({
            variables: validateNameInput!,
            skip: !validateNameInput,
            fetchPolicy: "no-cache",
        });

    const nameExists = validationData?.checkCampaignNameExists?.exists;

    // Initialize form data when campaign prop changes
    useEffect(() => {
        if (campaign) {
            setFormData({
                name: campaign.name || "",
                setting: campaign.setting || "",
                tone: campaign.tone || "",
                ruleset: campaign.ruleset || "",
            });
        } else {
            setFormData({
                name: "",
                setting: "",
                tone: "",
                ruleset: "",
            });
        }
        setNameError(null);
    }, [campaign]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = useCallback(
        async (e?: React.FormEvent) => {
            e?.preventDefault();

            if (!formData.name.trim()) {
                setNameError("Campaign name is required.");
                return;
            }

            if (nameError) {
                return;
            }

            try {
                if (isEditMode && campaign) {
                    // Update existing campaign
                    const { data } = await updateCampaign({
                        variables: {
                            input: {
                                campaignId: campaign.id,
                                name: formData.name.trim(),
                                setting: formData.setting.trim(),
                                tone: formData.tone.trim(),
                                ruleset: formData.ruleset ?? null,
                            },
                        },
                    });

                    if (data?.updateCampaign?.campaign) {
                        toast.success({
                            title: "Campaign Updated",
                            message: `"${formData.name}" has been updated successfully.`,
                            duration: 3000,
                        });
                        onSuccess(data.updateCampaign.campaign);
                    }
                } else {
                    // Create new campaign
                    const { data } = await createCampaign({
                        variables: {
                            input: {
                                name: formData.name.trim(),
                                setting: formData.setting.trim() || "",
                                tone: formData.tone.trim() || "",
                                ruleset: formData.ruleset,
                            },
                        },
                    });

                    const newCampaign = data?.createCampaign?.campaign;
                    if (newCampaign) {
                        toast.success({
                            title: "Campaign Created",
                            message: `"${formData.name}" has been created successfully.`,
                            duration: 0,
                        });
                        onSuccess(newCampaign);
                    }
                }
            } catch (_error) {
                toast.danger({
                    title: isEditMode ? "Update Failed" : "Creation Failed",
                    message: `Failed to ${isEditMode ? "update" : "create"} campaign. Please try again.`,
                    duration: 5000,
                });
            }
        },
        [
            formData,
            nameError,
            isEditMode,
            campaign,
            updateCampaign,
            createCampaign,
            toast,
            onSuccess,
        ]
    );

    const handleDeleteConfirm = useCallback(async () => {
        if (!campaign) return;

        try {
            const { data } = await deleteCampaign({
                variables: {
                    input: { campaignId: campaign.id },
                },
            });

            if (data?.deleteCampaign?.success) {
                toast.success({
                    title: "Campaign Deleted",
                    message: `"${campaign.name}" has been deleted.`,
                    duration: 5000,
                });
                if (onDelete) {
                    onDelete();
                }
            }
        } catch (_error) {
            toast.danger({
                title: "Deletion Failed",
                message: "Failed to delete campaign. Please try again.",
                duration: 5000,
            });
        }
    }, [campaign, deleteCampaign, toast, onDelete]);

    const isLoading = creating || updating || deleting;
    const canSubmit =
        formData.name.trim() && !isLoading && !nameExists && !validating;

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="campaignName">
                <Form.Label>Campaign Name *</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={nameExists}
                    disabled={isLoading}
                    placeholder="Enter campaign name"
                    autoFocus
                />
                <Form.Control.Feedback type="invalid">
                    A campaign with this name already exists. Please choose a
                    different name.
                </Form.Control.Feedback>
                {validating && (
                    <Form.Text className="text-muted">
                        Checking availability...
                    </Form.Text>
                )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="campaignSetting">
                <Form.Label>Setting</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="setting"
                    value={formData.setting}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="e.g., Real Earth, Fictional World"
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId="campaignTone">
                <Form.Label>Tone</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    name="tone"
                    value={formData.tone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="e.g., Comedic, Dark, Heroic"
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId="campaignRuleset">
                <Form.Label>Ruleset</Form.Label>
                <Form.Select
                    name="ruleset"
                    value={formData.ruleset}
                    onChange={handleInputChange}
                    disabled={isLoading}
                >
                    <option value="">Select a ruleset</option>
                    {RULESET_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center gap-2">
                {showDelete && isEditMode && (
                    <HoldConfirmButton
                        variant="danger"
                        onConfirm={handleDeleteConfirm}
                        disabled={isLoading}
                        holdDuration={1500}
                    >
                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                        Delete
                    </HoldConfirmButton>
                )}
                {!showDelete && <div />}
                <div className="d-flex gap-2">
                    {!isEditMode && !canCreate ? (
                        <OverlayTrigger
                            placement="top"
                            overlay={
                                <Popover>
                                    <Popover.Header as="h3">
                                        Campaign Limit Reached
                                    </Popover.Header>
                                    <Popover.Body>{limitMessage}</Popover.Body>
                                </Popover>
                            }
                        >
                            <div>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled
                                    className={submitButtonClassName}
                                >
                                    {isLoading
                                        ? "Saving..."
                                        : submitButtonText ||
                                          (isEditMode
                                              ? "Save Changes"
                                              : "Create Campaign")}
                                </Button>
                            </div>
                        </OverlayTrigger>
                    ) : (
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={!canSubmit}
                            className={submitButtonClassName}
                        >
                            {isLoading
                                ? "Saving..."
                                : submitButtonText ||
                                  (isEditMode
                                      ? "Save Changes"
                                      : "Create Campaign")}
                        </Button>
                    )}
                </div>
            </div>
        </Form>
    );
};
