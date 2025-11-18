import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    PlotDataFieldsFragment,
    PlotStatus,
    Urgency,
    useGetCampaignAssetQuery,
} from "@graphql";
import { type AssetModalState } from "@signals";
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import { Form } from "react-bootstrap";
import "./PlotForm.scss";

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
    ({ modalState }, ref) => {
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

        const { data: assetData } = useGetCampaignAssetQuery({
            variables: {
                input: {
                    assetId: modalState.assetId || "",
                },
            },
            skip: !modalState.assetId,
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
                    <Form.Label>
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
                    />
                    <Form.Control.Feedback type="invalid">
                        Name is required
                    </Form.Control.Feedback>
                </Form.Group>

                {/* Summary */}
                <Form.Group className="mb-3">
                    <Form.Label>Summary</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.summary}
                        onChange={(e) =>
                            handleInputChange("summary", e.target.value)
                        }
                        placeholder="Brief description of the plot"
                    />
                </Form.Group>

                {/* Status and Urgency */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <Form.Group>
                            <Form.Label>Status</Form.Label>
                            <Form.Select
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
                            <Form.Label>Urgency</Form.Label>
                            <Form.Select
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
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={formData.dmNotes}
                        onChange={(e) =>
                            handleInputChange("dmNotes", e.target.value)
                        }
                        placeholder="DM notes (not visible to players)"
                    />
                </Form.Group>

                {/* Shared with Players */}
                <Form.Group className="mb-3">
                    <Form.Label>Shared with Players</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.sharedWithPlayers}
                        onChange={(e) =>
                            handleInputChange(
                                "sharedWithPlayers",
                                e.target.value
                            )
                        }
                        placeholder="Information visible to players"
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
