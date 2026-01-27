import { faEdit, faEye, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    CreateCampaignAssetInput,
    RecordType,
    UpdateCampaignAssetInput,
    useCreateCampaignAssetMutation,
    useDeleteCampaignAssetMutation,
    useRevertToAssetVersionMutation,
    useUpdateCampaignAssetMutation,
} from "@graphql";
import { useAssetModalState } from "@hooks";
import {
    type AssetModalState,
    assetModalManager,
    useAssetModalZIndex,
} from "@signals";
import React, { useCallback, useEffect, useState } from "react";
import {
    Button,
    Col,
    OverlayTrigger,
    Popover,
    Row,
    Spinner,
} from "react-bootstrap";
import { useCampaignContext, useToaster } from "../../contexts";
import {
    DraggableModal,
    HeaderButtonConfig,
    HoldConfirmButton,
} from "../Common";
import { LogEvent } from "../firebase";
import { LocationForm, NPCForm, PlotForm } from "./forms";
import { ASSET_TYPE_ICONS } from "./models";
import type {
    AssetFormData,
    AssetMode,
    LocationFormData,
    NPCFormData,
    PlotFormData,
} from "./types";
import { VersionHistoryDropdown } from "./VersionHistoryDropdown";
import { LocationView, NPCView, PlotView } from "./views";
export interface AssetModalProps {
    modalState: AssetModalState;
}

/**
 * AssetModal - Modal component for creating and editing campaign assets
 *
 * This component is the single source of truth for asset data. It manages:
 * - Server data fetching via useAssetModalState hook
 * - Local form state
 * - Dirty/stale detection
 * - Save/delete operations
 *
 * The form components (PlotForm, NPCForm, LocationForm) are "dumb" display
 * components that receive data via props and report changes upward.
 */
export const AssetModal: React.FC<AssetModalProps> = ({ modalState }) => {
    const {
        modalId,
        assetType,
        assetId,
        isMinimized,
        position,
        name,
        isStale: isStaleFromModal,
    } = modalState;

    const { selectedCampaign } = useCampaignContext();
    const { toast } = useToaster();
    const [isSaving, setIsSaving] = useState(false);

    // Mode state - default to edit for new assets, view for existing
    const [mode, setMode] = useState<AssetMode>(() =>
        assetId ? "view" : "edit"
    );

    // Reset mode when asset changes
    useEffect(() => {
        setMode(assetId ? "view" : "edit");
    }, [assetId]);

    const { zIndex, bringToFront } = useAssetModalZIndex(modalId);

    // Use the custom hook for all state management
    const {
        formData,
        isDirty,
        isStale,
        isValid,
        isResetting,
        setFormField,
        handleReload,
        handleSaveComplete,
        versionHistory,
    } = useAssetModalState({
        assetId,
        assetType,
        modalId,
        initialName: name,
        isStale: isStaleFromModal ?? false,
    });

    const [createAsset] = useCreateCampaignAssetMutation();
    const [updateAsset] = useUpdateCampaignAssetMutation();
    const [deleteAsset] = useDeleteCampaignAssetMutation();
    const [revertToVersion, { loading: isReverting }] =
        useRevertToAssetVersionMutation();

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

    const handleMaximize = () => {
        assetModalManager.maximizeModal(modalId);
    };

    const handleSave = async () => {
        if (!selectedCampaign) return;

        setIsSaving(true);
        try {
            const sharedInput: Partial<
                UpdateCampaignAssetInput | CreateCampaignAssetInput
            > = {
                name: formData.name,
                gmSummary: formData.gmSummary,
                playerSummary: formData.playerSummary,
                gmNotes: formData.gmNotes,
                playerNotes: formData.playerNotes,
            };

            // Add type-specific data
            switch (assetType) {
                case RecordType.Plot: {
                    const plotData = formData as PlotFormData;
                    sharedInput.plotData = {
                        status: plotData.status,
                        urgency: plotData.urgency,
                    };
                    break;
                }
                case RecordType.Npc: {
                    const npcData = formData as NPCFormData;
                    sharedInput.npcData = {
                        physicalDescription: npcData.physicalDescription,
                        motivation: npcData.motivation,
                        mannerisms: npcData.mannerisms,
                    };
                    break;
                }
                case RecordType.Location: {
                    const locationData = formData as LocationFormData;
                    sharedInput.locationData = {
                        description: locationData.description,
                        condition: locationData.condition,
                        characters: locationData.characters,
                        pointsOfInterest: locationData.pointsOfInterest,
                    };
                    break;
                }
                default:
                    console.warn(
                        `Save not implemented for asset type: ${String(assetType).toLowerCase()}`
                    );
                    toast.warning({
                        message: `Save not implemented for asset type: ${String(assetType).toLowerCase()}`,
                    });
                    return;
            }

            if (assetId) {
                // Update existing asset
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
                    message: `${assetType} "${formData.name}" updated successfully`,
                });

                // Update modal name if changed
                if (sharedInput.name !== name) {
                    assetModalManager.updateModalName(modalId, formData.name);
                }

                // Sync form with server data and clear stale flag
                await handleSaveComplete();
                assetModalManager.clearStaleFlag(modalId);
                setMode("view");
            } else {
                // Create new asset
                if (!sharedInput.name) {
                    // Form validation should prevent this, but double-check
                    return;
                }

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
                    message: `${assetType} "${formData.name}" created successfully`,
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

    const handleRevert = async (versionId: string) => {
        if (!assetId) return;
        try {
            await revertToVersion({
                variables: { input: { assetId, versionId } },
                awaitRefetchQueries: true,
                refetchQueries: ["ListCampaignAssets"],
            });
            toast.success({
                message: "Reverted to previous version successfully",
            });
            await handleReload();
            setMode("view"); // Return to view mode after revert
            LogEvent("revert_asset_version", {
                assetType: assetType,
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            toast.danger({ message: `Failed to revert: ${errorMessage}` });
        }
    };

    // Generic onChange handler that works with all form types
    const handleFormChange = useCallback(
        <T extends AssetFormData, K extends keyof T>(field: K, value: T[K]) => {
            setFormField(field, value);
        },
        [setFormField]
    );

    // Handle Edit button click
    const changeMode = () => {
        setMode((mode) => (mode === "view" ? "edit" : "view"));
    };

    // Handle Cancel button click
    const handleCancel = async () => {
        await handleReload();
        setMode("view");
    };

    // Render the appropriate content based on mode and asset type
    const renderContent = () => {
        if (isResetting) {
            return (
                <div className="text-center p-4">
                    <Spinner animation="border" role="status" />
                    <p className="mt-2">Reloading...</p>
                </div>
            );
        }

        // View mode - render view components
        if (mode === "view") {
            switch (assetType) {
                case RecordType.Npc:
                    return <NPCView formData={formData as NPCFormData} />;
                case RecordType.Location:
                    return (
                        <LocationView formData={formData as LocationFormData} />
                    );
                case RecordType.Plot:
                    return <PlotView formData={formData as PlotFormData} />;
            }
        }

        // Edit mode - render forms
        switch (assetType) {
            case RecordType.Plot:
                return (
                    <PlotForm
                        formData={formData as PlotFormData}
                        onChange={handleFormChange}
                        disabled={isSaving}
                    />
                );
            case RecordType.Npc:
                return (
                    <NPCForm
                        formData={formData as NPCFormData}
                        onChange={handleFormChange}
                        disabled={isSaving}
                    />
                );
            case RecordType.Location:
                return (
                    <LocationForm
                        formData={formData as LocationFormData}
                        onChange={handleFormChange}
                        disabled={isSaving}
                    />
                );
        }
    };

    const headerButtons: HeaderButtonConfig[] = assetId
        ? [
              {
                  id: "edit-button",
                  activeIcon: faEye, // Show eye when in edit mode (click to view)
                  inactiveIcon: faEdit, // Show edit when in view mode (click to edit)
                  isActive: mode === "edit",
                  onToggle: changeMode,
                  title: mode === "view" ? "Edit" : "View",
                  showMinimized: false,
              },
          ]
        : [];

    const footer = (
        <Row className="d-flex justify-content-between w-100 gap-2">
            <Col xs="auto" className="d-flex gap-2 align-items-center">
                {assetId && (
                    <VersionHistoryDropdown
                        versions={versionHistory}
                        onRevert={handleRevert}
                        disabled={isResetting}
                        isReverting={isReverting}
                    />
                )}
                {isStale && isDirty && (
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Popover>
                                <Popover.Header as="h3">
                                    Asset Stale
                                </Popover.Header>
                                <Popover.Body>
                                    This asset was modified elsewhere and your
                                    changes may overwrite those updates. It is
                                    recommended to reload the asset to get the
                                    latest data.
                                </Popover.Body>
                            </Popover>
                        }
                    >
                        <div>
                            <HoldConfirmButton
                                onConfirm={handleReload}
                                variant="warning"
                                holdDuration={1000}
                                disabled={isResetting}
                            >
                                <FontAwesomeIcon
                                    icon={faSync}
                                    className="me-1"
                                />
                                {isResetting ? "Reloading..." : "Reload"}
                            </HoldConfirmButton>
                        </div>
                    </OverlayTrigger>
                )}
            </Col>
            <Col xs="auto" className="d-flex gap-2 align-items-center">
                {isDirty && !isStale && (
                    <span className="text-secondary small fst-italic">
                        Unsaved changes
                    </span>
                )}
                {/* Save button with stale handling */}
                {isStale ? (
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Popover>
                                <Popover.Header as="h3">
                                    Asset Stale
                                </Popover.Header>
                                <Popover.Body>
                                    This asset was modified elsewhere. Saving
                                    now would overwrite those updates. It is
                                    recommended to reload the asset to get the
                                    latest data.
                                </Popover.Body>
                            </Popover>
                        }
                    >
                        <div>
                            <HoldConfirmButton
                                onConfirm={handleSave}
                                variant="primary"
                                holdDuration={1000}
                                disabled={
                                    isSaving ||
                                    !isValid ||
                                    isResetting ||
                                    !isDirty
                                }
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </HoldConfirmButton>
                        </div>
                    </OverlayTrigger>
                ) : (
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={
                            isSaving || !isValid || isResetting || !isDirty
                        }
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                )}
                {/* Cancel button - only for existing assets*/}
                {assetId && (
                    <HoldConfirmButton
                        variant="secondary"
                        onConfirm={handleCancel}
                        disabled={isSaving || isResetting || !isDirty}
                        holdDuration={1000}
                    >
                        Cancel
                    </HoldConfirmButton>
                )}
                {assetId && (
                    <HoldConfirmButton
                        onConfirm={handleDelete}
                        variant="danger"
                        disabled={isSaving || isResetting}
                    >
                        {isSaving ? "Deleting..." : "Delete"}
                    </HoldConfirmButton>
                )}
            </Col>
        </Row>
    );

    return (
        <DraggableModal
            title={
                <div>
                    <FontAwesomeIcon
                        icon={ASSET_TYPE_ICONS[assetType]}
                        className="me-2"
                    />
                    {assetType}: {formData.name || name}
                </div>
            }
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            isMinimized={isMinimized}
            onPositionChange={handlePositionChange}
            initialX={position?.x}
            initialY={position?.y}
            footer={footer}
            zIndex={zIndex}
            onInteract={bringToFront}
            headerButtons={headerButtons}
        >
            {renderContent()}
        </DraggableModal>
    );
};
