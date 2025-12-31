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
    gmSummary: string;
    playerSummary: string;
    status: PlotStatus;
    urgency: Urgency;
    gmNotes: string;
    playerNotes: string;
}

export interface PlotFormRef {
    getFormData: () => PlotFormData;
}

export interface PlotFormProps {
    modalState: AssetModalState;
    onChange?: (isValid: boolean) => void;
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
            gmSummary: "",
            playerSummary: "",
            status: PlotStatus.Rumored,
            urgency: Urgency.Ongoing,
            gmNotes: "",
            playerNotes: "",
        });
        const [initialized, setInitialized] = useState(false);
        const formId = useId();

        // Auto-grow textarea refs
        // Auto-grow textarea refs
        const gmSummaryRef = useAutoGrowTextarea(formData.gmSummary, 3);
        const gmNotesRef = useAutoGrowTextarea(formData.gmNotes, 4);
        const playerNotesRef = useAutoGrowTextarea(formData.playerNotes, 3);

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
                gmSummary: asset.gmSummary || "",
                playerSummary: asset.playerSummary || "",
                status: plotData?.status || PlotStatus.InProgress,
                urgency: plotData?.urgency || Urgency.Ongoing,
                gmNotes: asset.gmNotes || "",
                playerNotes: asset.playerNotes || "",
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
            value: string | PlotStatus | Urgency
        ) => {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
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

                {/* GM Summary */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor={`${formId}-gm-summary`}>
                        GM Summary
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        ref={gmSummaryRef}
                        value={formData.gmSummary}
                        onChange={(e) =>
                            handleInputChange("gmSummary", e.target.value)
                        }
                        placeholder="Brief description of the plot"
                        id={`${formId}-gm-summary`}
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

                {/* GM Notes */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor={`${formId}-gm-notes`}>
                        GM Notes
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        ref={gmNotesRef}
                        value={formData.gmNotes}
                        onChange={(e) =>
                            handleInputChange("gmNotes", e.target.value)
                        }
                        placeholder="GM notes (not visible to players)"
                        id={`${formId}-gm-notes`}
                        style={{ overflow: "hidden", resize: "none" }}
                    />
                </Form.Group>

                {/* Shared with Players */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor={`${formId}-player-notes`}>
                        Player Notes (Shared)
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        ref={playerNotesRef}
                        value={formData.playerNotes}
                        onChange={(e) =>
                            handleInputChange("playerNotes", e.target.value)
                        }
                        placeholder="Information visible to players"
                        id={`${formId}-player-notes`}
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
