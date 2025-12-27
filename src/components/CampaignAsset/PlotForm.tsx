import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    PlotDataFieldsFragment,
    PlotStatus,
    Urgency,
    useGetCampaignAssetQuery,
} from "@graphql";
import { useAutoGrowTextarea } from "@hooks";
import { type AssetModalState } from "@signals";
import React, {
    forwardRef,
    useEffect,
    useId,
    useImperativeHandle,
    useState,
} from "react";
import { Form } from "react-bootstrap";

export interface PlotFormData {
    name: string;
    summary: string;
    playerSummary: string;
    status: PlotStatus;
    urgency: Urgency;
    relatedAssets: RelatedAsset[];
    dmNotes: string;
    sharedWithPlayers: string;
}

export interface PlotFormRef {
    getFormData: () => PlotFormData;
}

export interface PlotFormProps {
    modalState: AssetModalState;
    onChange?: (isValid: boolean) => void;
}

interface RelatedAsset {
    relatedAssetId: string;
    relationshipSummary: string;
}

const STATUS_OPTIONS: { value: PlotStatus; label: string }[] = [
    { value: PlotStatus.Unknown, label: "Unknown" },
    { value: PlotStatus.Rumored, label: "Rumored" },
    { value: PlotStatus.InProgress, label: "In Progress" },
    { value: PlotStatus.Closed, label: "Completed" },
    { value: PlotStatus.WillNotDo, label: "Will Not Do" },
];

const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
    { value: Urgency.Ongoing, label: "Ongoing" },
    { value: Urgency.Critical, label: "Critical" },
    { value: Urgency.Resolved, label: "Resolved" },
];

const PlotFormComponent = forwardRef<PlotFormRef, PlotFormProps>(
    ({ modalState, onChange }, ref) => {
        const [formData, setFormData] = useState<PlotFormData>({
            name: modalState.name === "New Asset" ? "" : modalState.name,
            summary: "",
            playerSummary: "",
            status: PlotStatus.Rumored,
            urgency: Urgency.Ongoing,
            relatedAssets: [],
            dmNotes: "",
            sharedWithPlayers: "",
        });
        const [initialized, setInitialized] = useState(false);
        const formId = useId();

        // Auto-grow textarea refs
        const summaryRef = useAutoGrowTextarea(formData.summary, 3);
        const dmNotesRef = useAutoGrowTextarea(formData.dmNotes, 4);
        const sharedWithPlayersRef = useAutoGrowTextarea(
            formData.sharedWithPlayers,
            3
        );

        const { data: assetData } = useGetCampaignAssetQuery({
            variables: {
                input: {
                    assetId: modalState.assetId || "",
                },
            },
            skip: !modalState.assetId,
            fetchPolicy: "network-only",
        });

        // Populate form when asset data loads
        useEffect(() => {
            if (initialized || !assetData?.getCampaignAsset?.asset) return;
            const asset = assetData.getCampaignAsset.asset;
            const plotData = asset.data as PlotDataFieldsFragment;

            const loadedData = {
                name: asset.name || "",
                summary: asset.summary || "",
                playerSummary: asset.playerSummary || "",
                status: plotData?.status || PlotStatus.InProgress,
                urgency: plotData?.urgency || Urgency.Ongoing,
                relatedAssets: plotData?.relatedAssets || [],
                dmNotes: plotData?.dmNotes || "",
                sharedWithPlayers: plotData?.sharedWithPlayers || "",
            };
            setFormData(loadedData);
            setInitialized(true);
        }, [assetData, initialized]);

        // Notify parent of changes
        useEffect(() => {
            onChange?.(!!formData.name);
        }, [formData, onChange]);

        // Expose getFormData method to parent via ref
        useImperativeHandle(ref, () => ({
            getFormData: () => formData,
        }));

        const handleInputChange = (
            field: keyof PlotFormData,
            value: string | PlotStatus | Urgency | RelatedAsset[]
        ) => {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        };

        const handleRemoveRelatedAsset = (assetId: string) => {
            setFormData((prev) => ({
                ...prev,
                relatedAssets: prev.relatedAssets.filter(
                    (a) => a.relatedAssetId !== assetId
                ),
            }));
        };

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
                        onChange={(e) =>
                            handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter plot name"
                        required
                        isInvalid={!formData.name}
                        id={`${formId}-name`}
                    />
                    <Form.Control.Feedback type="invalid">
                        Name is required
                    </Form.Control.Feedback>
                </Form.Group>

                {/* Summary */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor={`${formId}-summary`}>
                        Summary
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        ref={summaryRef}
                        value={formData.summary}
                        onChange={(e) =>
                            handleInputChange("summary", e.target.value)
                        }
                        placeholder="Brief description of the plot"
                        id={`${formId}-summary`}
                        style={{ overflow: "hidden", resize: "none" }}
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
                                    handleInputChange(
                                        "status",
                                        e.target.value as PlotStatus
                                    )
                                }
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
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
                                    handleInputChange(
                                        "urgency",
                                        e.target.value as Urgency
                                    )
                                }
                            >
                                {URGENCY_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </div>
                </div>

                {/* Related Assets */}
                <Form.Group className="mb-3">
                    <Form.Label>Related</Form.Label>
                    <div className="d-flex flex-wrap gap-2">
                        {formData.relatedAssets.map((asset) => (
                            <div
                                key={asset.relatedAssetId}
                                className="badge bg-secondary d-flex align-items-center gap-2"
                                style={{
                                    fontSize: "0.9rem",
                                    padding: "0.5rem",
                                }}
                            >
                                {asset.relationshipSummary}
                                <FontAwesomeIcon
                                    icon={faXmark}
                                    className="cursor-pointer"
                                    onClick={() =>
                                        handleRemoveRelatedAsset(
                                            asset.relatedAssetId
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </Form.Group>

                {/* Notes */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor={`${formId}-dm-notes`}>
                        Notes
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        ref={dmNotesRef}
                        value={formData.dmNotes}
                        onChange={(e) =>
                            handleInputChange("dmNotes", e.target.value)
                        }
                        placeholder="DM notes (not visible to players)"
                        id={`${formId}-dm-notes`}
                        style={{ overflow: "hidden", resize: "none" }}
                    />
                </Form.Group>

                {/* Shared with Players */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor={`${formId}-shared-with-players`}>
                        Shared with Players
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        ref={sharedWithPlayersRef}
                        value={formData.sharedWithPlayers}
                        onChange={(e) =>
                            handleInputChange(
                                "sharedWithPlayers",
                                e.target.value
                            )
                        }
                        placeholder="Information visible to players"
                        id={`${formId}-shared-with-players`}
                        style={{ overflow: "hidden", resize: "none" }}
                    />
                </Form.Group>
            </Form>
        );
    }
);

// Memoize the component to prevent re-renders when only position/size changes
// Only re-render when assetId or name changes
export const PlotForm = React.memo(
    PlotFormComponent,
    (prevProps, nextProps) => {
        return (
            prevProps.modalState.assetId === nextProps.modalState.assetId &&
            prevProps.modalState.name === nextProps.modalState.name
        );
    }
);
