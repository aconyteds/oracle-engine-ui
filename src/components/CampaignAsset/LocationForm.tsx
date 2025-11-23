import { LocationDataFieldsFragment, useGetCampaignAssetQuery } from "@graphql";
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
    summary: string;
    playerSummary: string;
    description: string;
    condition: string;
    characters: string;
    pointsOfInterest: string;
    dmNotes: string;
    sharedWithPlayers: string;
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
            summary: "",
            playerSummary: "",
            description: "",
            condition: "",
            characters: "",
            pointsOfInterest: "",
            dmNotes: "",
            sharedWithPlayers: "",
        });
        const [initialized, setInitialized] = useState(false);
        const formId = useId();

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
                summary: asset.summary || "",
                playerSummary: asset.playerSummary || "",
                description: locationData?.description || "",
                condition: locationData?.condition || "",
                characters: locationData?.characters || "",
                pointsOfInterest: locationData?.pointsOfInterest || "",
                dmNotes: locationData?.dmNotes || "",
                sharedWithPlayers: locationData?.sharedWithPlayers || "",
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

                {/* Summary */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor={`${formId}-summary`}>
                        Summary
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={formData.summary}
                        onChange={(e) =>
                            handleInputChange("summary", e.target.value)
                        }
                        placeholder="Brief summary of the location"
                        id={`${formId}-summary`}
                    />
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor={`${formId}-description`}>
                        Description
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                            handleInputChange("description", e.target.value)
                        }
                        placeholder="Detailed description"
                        id={`${formId}-description`}
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
                        rows={2}
                        value={formData.characters}
                        onChange={(e) =>
                            handleInputChange("characters", e.target.value)
                        }
                        placeholder="Key characters present"
                        id={`${formId}-characters`}
                    />
                </Form.Group>

                {/* Points of Interest */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor={`${formId}-points-of-interest`}>
                        Points of Interest
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={formData.pointsOfInterest}
                        onChange={(e) =>
                            handleInputChange(
                                "pointsOfInterest",
                                e.target.value
                            )
                        }
                        placeholder="Notable spots within this location"
                        id={`${formId}-points-of-interest`}
                    />
                </Form.Group>

                {/* Notes */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor={`${formId}-dm-notes`}>
                        Notes
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={formData.dmNotes}
                        onChange={(e) =>
                            handleInputChange("dmNotes", e.target.value)
                        }
                        placeholder="DM notes (not visible to players)"
                        id={`${formId}-dm-notes`}
                    />
                </Form.Group>

                {/* Shared with Players */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor={`${formId}-shared-with-players`}>
                        Shared with Players
                    </Form.Label>
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
                        id={`${formId}-shared-with-players`}
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
