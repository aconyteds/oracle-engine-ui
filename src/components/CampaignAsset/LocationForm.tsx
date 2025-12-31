import { LocationDataFieldsFragment, useGetCampaignAssetQuery } from "@graphql";
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

export interface LocationFormData {
    name: string;
    gmSummary: string;
    playerSummary: string;
    description: string;
    condition: string;
    characters: string;
    pointsOfInterest: string;
    gmNotes: string;
    playerNotes: string;
}

export interface LocationFormRef {
    getFormData: () => LocationFormData;
}

export interface LocationFormProps {
    modalState: AssetModalState;
    onChange?: (isValid: boolean) => void;
}

const LocationFormComponent = forwardRef<LocationFormRef, LocationFormProps>(
    ({ modalState, onChange }, ref) => {
        const [formData, setFormData] = useState<LocationFormData>({
            name: modalState.name === "New Asset" ? "" : modalState.name,
            gmSummary: "",
            playerSummary: "",
            description: "",
            condition: "",
            characters: "",
            pointsOfInterest: "",
            gmNotes: "",
            playerNotes: "",
        });
        const [initialized, setInitialized] = useState(false);
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
            const locationData = asset.data as LocationDataFieldsFragment;

            const loadedData = {
                name: asset.name || "",
                gmSummary: asset.gmSummary || "",
                playerSummary: asset.playerSummary || "",
                description: locationData?.description || "",
                condition: locationData?.condition || "",
                characters: locationData?.characters || "",
                pointsOfInterest: locationData?.pointsOfInterest || "",
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
            field: keyof LocationFormData,
            value: string
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
                        placeholder="Enter location name"
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
                        placeholder="Brief summary of the location"
                        id={`${formId}-gm-summary`}
                        style={{ overflow: "hidden", resize: "none" }}
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
                        onChange={(e) =>
                            handleInputChange("description", e.target.value)
                        }
                        placeholder="Detailed description"
                        id={`${formId}-description`}
                        style={{ overflow: "hidden", resize: "none" }}
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
                        onChange={(e) =>
                            handleInputChange("condition", e.target.value)
                        }
                        placeholder="Current condition (e.g. Ruined, Bustling)"
                        id={`${formId}-condition`}
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
                        onChange={(e) =>
                            handleInputChange("characters", e.target.value)
                        }
                        placeholder="Key characters present"
                        id={`${formId}-characters`}
                        style={{ overflow: "hidden", resize: "none" }}
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
                            handleInputChange(
                                "pointsOfInterest",
                                e.target.value
                            )
                        }
                        placeholder="Notable spots within this location"
                        id={`${formId}-points-of-interest`}
                        style={{ overflow: "hidden", resize: "none" }}
                    />
                </Form.Group>

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
export const LocationForm = React.memo(
    LocationFormComponent,
    (prevProps, nextProps) => {
        return (
            prevProps.modalState.assetId === nextProps.modalState.assetId &&
            prevProps.modalState.name === nextProps.modalState.name
        );
    }
);
