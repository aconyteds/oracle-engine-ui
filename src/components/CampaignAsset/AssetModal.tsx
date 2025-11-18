import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    CreateCampaignAssetInput,
    RecordType,
    UpdateCampaignAssetInput,
    useCreateCampaignAssetMutation,
    useDeleteCampaignAssetMutation,
    useUpdateCampaignAssetMutation,
} from "@graphql";
import { type AssetModalState, assetModalManager } from "@signals";
import React, { useCallback, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { useCampaignContext, useToaster } from "../../contexts";
import { DraggableModal, HoldConfirmButton } from "../Common";
import { LogEvent } from "../firebase";
import { ASSET_TYPE_ICONS } from "./models";
import { PlotForm, type PlotFormRef } from "./PlotForm";

export interface AssetModalProps {
    modalState: AssetModalState;
}

export const AssetModal: React.FC<AssetModalProps> = ({ modalState }) => {
    const { modalId, assetType, assetId, isMinimized, position, name } =
        modalState;
    const { selectedCampaign } = useCampaignContext();
    const { toast } = useToaster();
    const [isSaving, setIsSaving] = useState(false);
    const formRef = useRef<PlotFormRef>(null);

    const [createAsset] = useCreateCampaignAssetMutation();
    const [updateAsset] = useUpdateCampaignAssetMutation();
    const [deleteAsset] = useDeleteCampaignAssetMutation();

    const handleClose = () => {
        assetModalManager.closeModal(modalId);
    };

    const handleMinimize = () => {
        assetModalManager.minimizeModal(modalId);
    };

    const handlePositionChange = useCallback(
        (newPosition: { x: number; y: number }) => {
            assetModalManager.updateModalTransform(modalId, newPosition);
        },
        [modalId]
    );

    const handleSave = async () => {
        if (!selectedCampaign || !formRef.current) return;

        const formData = formRef.current.getFormData();
        if (!formData) return;

        setIsSaving(true);
        try {
            const sharedInput: Partial<
                UpdateCampaignAssetInput | CreateCampaignAssetInput
            > = {
                name: formData.name,
                summary: formData.summary,
                playerSummary: formData.playerSummary,
            };
            switch (assetType) {
                case RecordType.Plot:
                    sharedInput.plotData = {
                        status: formData.status,
                        urgency: formData.urgency,
                        relatedAssets: formData.relatedAssets,
                        dmNotes: formData.dmNotes,
                        sharedWithPlayers: formData.sharedWithPlayers,
                    };
                    break;
                // Future asset types can be handled here
                default:
                    console.warn(
                        `Save not implemented for asset type: ${assetType.toLowerCase()}`
                    );
                    toast.warning({
                        message: `Save not implemented for asset type: ${assetType.toLowerCase()}`,
                    });
                    return;
            }
            if (assetId) {
                // Update existing
                await updateAsset({
                    variables: {
                        input: {
                            assetId: assetId,
                            recordType: assetType,
                            ...sharedInput,
                        },
                    },
                    awaitRefetchQueries: true,
                    refetchQueries: ["ListCampaignAssets"],
                });

                LogEvent("edit_asset", {
                    campaignId: selectedCampaign.id,
                    assetType: assetType,
                });

                toast.success({
                    message: `${assetType.toLowerCase()} "${formData.name}" updated successfully`,
                });

                // Update modal name if changed
                if (sharedInput.name !== name) {
                    assetModalManager.updateModalName(modalId, formData.name);
                }
            } else {
                if (!sharedInput.name) {
                    // Form validation should prevent this, but double-check
                    return;
                }
                // Create new
                const result = await createAsset({
                    variables: {
                        input: {
                            campaignId: selectedCampaign.id,
                            recordType: assetType,
                            ...sharedInput,
                            name: sharedInput.name,
                        } as CreateCampaignAssetInput,
                    },
                    awaitRefetchQueries: true,
                    refetchQueries: ["ListCampaignAssets"],
                });
                LogEvent("create_asset", {
                    campaignId: selectedCampaign.id,
                    assetType: assetType,
                });

                toast.success({
                    message: `${assetType.toLowerCase()} "${formData.name}" created successfully`,
                });

                // Close the "New Asset" modal and open with the real asset ID at same position
                const newAssetId = result.data?.createCampaignAsset?.asset?.id;
                if (newAssetId) {
                    assetModalManager.closeModal(modalId);
                    const newModalId = assetModalManager.openModal(
                        assetType,
                        newAssetId,
                        formData.name
                    );
                    // Preserve position if it was set
                    if (position) {
                        assetModalManager.updateModalTransform(
                            newModalId,
                            position
                        );
                    }
                }
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";
            toast.danger({
                message: `Failed to save ${assetType.toLowerCase()}: ${errorMessage}`,
            });
            console.error("Error saving asset:", error);
        } finally {
            setIsSaving(false);
        }
    };
    const handleDelete = async () => {
        if (!assetId) return;

        setIsSaving(true);
        try {
            await deleteAsset({
                variables: {
                    input: {
                        assetId: assetId,
                    },
                },
                awaitRefetchQueries: true,
                refetchQueries: ["ListCampaignAssets"],
            });

            toast.success({
                message: `${assetType.toLowerCase()} "${name}" deleted successfully`,
            });

            // Close modal after deletion
            assetModalManager.closeModal(modalId);
            LogEvent("delete_asset", {
                campaignId: selectedCampaign?.id || "",
                assetType: assetType,
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";
            toast.danger({
                message: `Failed to delete ${assetType.toLowerCase()}: ${errorMessage}`,
            });
            console.error("Error deleting asset:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isMinimized) {
        return null;
    }

    const footer = (
        <div className="d-flex justify-content-end w-100 gap-2">
            {assetId && (
                <HoldConfirmButton
                    onConfirm={handleDelete}
                    variant="danger"
                    disabled={isSaving || !assetId}
                >
                    {isSaving ? "Deleting..." : "Delete"}
                </HoldConfirmButton>
            )}
            <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || !formRef.current?.getFormData()?.name}
            >
                {isSaving ? "Saving..." : "Save"}
            </Button>
        </div>
    );

    return (
        <DraggableModal
            modalId={modalId}
            title={
                <div>
                    <FontAwesomeIcon
                        icon={ASSET_TYPE_ICONS[assetType]}
                        className="me-2"
                    />
                    {assetType}: {name}
                </div>
            }
            onClose={handleClose}
            onMinimize={handleMinimize}
            onPositionChange={handlePositionChange}
            initialX={position?.x}
            initialY={position?.y}
            footer={footer}
        >
            {assetType === RecordType.Plot ? (
                <PlotForm ref={formRef} modalState={modalState} />
            ) : (
                <div>Unsupported asset type.</div>
            )}
        </DraggableModal>
    );
};
