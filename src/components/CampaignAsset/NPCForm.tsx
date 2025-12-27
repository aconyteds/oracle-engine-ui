import { type NpcDataFieldsFragment, useGetCampaignAssetQuery } from "@graphql";
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

export interface NPCFormData {
    name: string;
    summary: string;
    playerSummary: string;
    physicalDescription: string;
    motivation: string;
    mannerisms: string;
    dmNotes: string;
    sharedWithPlayers: string;
}

export interface NPCFormRef {
    getFormData: () => NPCFormData;
}

export interface NPCFormProps {
    modalState: AssetModalState;
    onChange?: (isValid: boolean) => void;
}

const NPCFormComponent = forwardRef<NPCFormRef, NPCFormProps>(
    ({ modalState, onChange }, ref) => {
        const [formData, setFormData] = useState<NPCFormData>({
            name: modalState.name === "New Asset" ? "" : modalState.name,
            summary: "",
            playerSummary: "",
            physicalDescription: "",
            motivation: "",
            mannerisms: "",
            dmNotes: "",
            sharedWithPlayers: "",
        });
        const [initialized, setInitialized] = useState(false);
        const formId = useId();

        // Auto-grow textarea refs
        const physicalDescriptionRef = useAutoGrowTextarea(
            formData.physicalDescription,
            2
        );
        const motivationRef = useAutoGrowTextarea(formData.motivation, 2);
        const mannerismsRef = useAutoGrowTextarea(formData.mannerisms, 3);
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
            const npcData = asset.data as NpcDataFieldsFragment;

            const loadedData = {
                name: asset.name || "",
                summary: asset.summary || "",
                playerSummary: asset.playerSummary || "",
                physicalDescription: npcData?.physicalDescription || "",
                motivation: npcData?.motivation || "",
                mannerisms: npcData?.mannerisms || "",
                dmNotes: npcData?.dmNotes || "",
                sharedWithPlayers: npcData?.sharedWithPlayers || "",
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

        const handleInputChange = (field: keyof NPCFormData, value: string) => {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        };

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
                        onChange={(e) =>
                            handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter NPC name"
                        required
                        isInvalid={!formData.name}
                        id={`${formId}-name`}
                    />
                    <Form.Control.Feedback type="invalid">
                        Name is required
                    </Form.Control.Feedback>
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
                            handleInputChange(
                                "physicalDescription",
                                e.target.value
                            )
                        }
                        placeholder="Describe the NPC's appearance"
                        id={`${formId}-physical-description`}
                        style={{ overflow: "hidden", resize: "none" }}
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
                        onChange={(e) =>
                            handleInputChange("motivation", e.target.value)
                        }
                        placeholder="What drives this NPC?"
                        id={`${formId}-motivation`}
                        style={{ overflow: "hidden", resize: "none" }}
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
                        onChange={(e) =>
                            handleInputChange("mannerisms", e.target.value)
                        }
                        placeholder="Distinctive behaviors, speech patterns, or quirks"
                        id={`${formId}-mannerisms`}
                        style={{ overflow: "hidden", resize: "none" }}
                    />
                </Form.Group>

                {/* DM Notes */}
                <Form.Group className="mb-3">
                    <Form.Label htmlFor={`${formId}-dm-notes`}>
                        DM Notes
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
export const NPCForm = React.memo(NPCFormComponent, (prevProps, nextProps) => {
    return (
        prevProps.modalState.assetId === nextProps.modalState.assetId &&
        prevProps.modalState.name === nextProps.modalState.name
    );
});
