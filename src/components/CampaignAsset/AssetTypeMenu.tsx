import { useCampaignContext } from "@context";
import {
    faChevronRight,
    faMaximize,
    faPlus,
    faWindowMinimize,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
    FontAwesomeIcon,
    FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import {
    ListCampaignAssetsInput,
    RecordType,
    useListCampaignAssetsQuery,
} from "@graphql";
import { assetModalManager, useAssetModals } from "@signals";
import React, { useEffect, useMemo, useState } from "react";
import { Dropdown } from "react-bootstrap";

interface AssetTypeMenuProps {
    assetType: RecordType;
    label: string;
    icon: FontAwesomeIconProps["icon"];
}

interface RecentAsset {
    id: string;
    name: string;
}

export const AssetTypeMenu: React.FC<AssetTypeMenuProps> = ({
    assetType,
    label,
    icon,
}) => {
    const { selectedCampaign } = useCampaignContext();
    const {
        getModalsByType,
        hasModalForAsset,
        minimizeAllByType,
        maximizeAllByType,
        closeAllByType,
    } = useAssetModals();
    const [recentAssets, setRecentAssets] = useState<RecentAsset[]>([]);

    const input = useMemo<ListCampaignAssetsInput>(
        () => ({
            campaignId: selectedCampaign?.id || "",
            recordType: assetType,
            limit: 5,
        }),
        [selectedCampaign, assetType]
    );

    const { data: assetsData } = useListCampaignAssetsQuery({
        fetchPolicy: "cache-and-network",
        skip: !selectedCampaign,
        variables: { input },
    });

    // Update recent assets from query
    useEffect(() => {
        if (assetsData?.listCampaignAssets?.assets) {
            const assets = assetsData.listCampaignAssets.assets
                .map((asset) => ({
                    id: asset.id,
                    name: asset.name || "Unnamed",
                    updatedAt: asset.updatedAt,
                }))
                .sort((a, b) => {
                    // Sort by updatedAt descending (most recent first)
                    return (
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime()
                    );
                });
            setRecentAssets(assets);
        }
    }, [assetsData]);

    // Get open modals - memoized to prevent unnecessary re-renders
    // The signal reactivity will still work because useSignals() in useAssetModals
    // causes re-renders when the signal changes, and useMemo will recompute
    const openModals = useMemo(
        () => getModalsByType(assetType),
        [getModalsByType, assetType]
    );
    const count = openModals.length;

    const handleGenerateNew = () => {
        assetModalManager.openModal(assetType, null, "New Asset");
    };

    const handleOpenAsset = (assetId: string, name: string) => {
        // openModal now handles checking for existing modals and maximizing if minimized
        assetModalManager.openModal(assetType, assetId, name);
    };

    const handleToggleMinimize = (modalId: string) => {
        assetModalManager.toggleMinimize(modalId);
    };

    const handleCloseModal = (modalId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        assetModalManager.closeModal(modalId);
    };

    const handleMaximizeAll = () => {
        maximizeAllByType(assetType);
    };

    const handleMinimizeAll = () => {
        minimizeAllByType(assetType);
    };

    const handleCloseAll = () => {
        closeAllByType(assetType);
    };

    return (
        <Dropdown drop="end" autoClose="outside">
            <Dropdown.Toggle
                as="div"
                className="dropdown-item d-flex justify-content-between align-items-center asset-type-toggle"
                style={{ cursor: "pointer" }}
            >
                <div className="d-flex align-items-center gap-2">
                    <FontAwesomeIcon icon={icon} size="sm" />
                    {label}s ({count})
                </div>
                <FontAwesomeIcon icon={faChevronRight} size="xs" />
            </Dropdown.Toggle>
            <Dropdown.Menu renderOnMount>
                {/* Generate New */}
                <Dropdown.Item onClick={handleGenerateNew}>
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Generate New
                </Dropdown.Item>

                <Dropdown.Divider />

                {/* Open modals section */}
                {count > 0 && (
                    <>
                        <Dropdown.Header className="d-flex justify-content-between align-items-center">
                            <span>Active {label}s</span>
                            <div className="d-flex gap-2">
                                <FontAwesomeIcon
                                    icon={faWindowMinimize}
                                    size="sm"
                                    title="Minimize All"
                                    onClick={handleMinimizeAll}
                                    className="minimize-all-icon cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                />
                                <FontAwesomeIcon
                                    icon={faMaximize}
                                    size="sm"
                                    title="Maximize All"
                                    onClick={handleMaximizeAll}
                                    className="maximize-all-icon cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                />
                                <FontAwesomeIcon
                                    icon={faXmark}
                                    size="sm"
                                    title="Close All"
                                    onClick={handleCloseAll}
                                    className="close-icon cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                />
                            </div>
                        </Dropdown.Header>
                        {openModals.map((modal) => (
                            <Dropdown.Item
                                key={modal.modalId}
                                onClick={() =>
                                    handleToggleMinimize(modal.modalId)
                                }
                                className="d-flex gap-2 justify-content-between align-items-center asset-item"
                            >
                                <span className="text-truncate">
                                    {modal.name}
                                </span>
                                <div className="d-flex gap-2">
                                    {modal.isMinimized ? (
                                        <FontAwesomeIcon
                                            icon={faMaximize}
                                            size="sm"
                                            title="Maximize"
                                        />
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faWindowMinimize}
                                            size="sm"
                                            title="Minimize"
                                        />
                                    )}
                                    <FontAwesomeIcon
                                        icon={faXmark}
                                        size="sm"
                                        title="Close"
                                        onClick={(e) =>
                                            handleCloseModal(modal.modalId, e)
                                        }
                                        className="close-icon"
                                        role="button"
                                        tabIndex={0}
                                    />
                                </div>
                            </Dropdown.Item>
                        ))}
                    </>
                )}

                {count > 0 && recentAssets.length > 0 && <Dropdown.Divider />}

                {/* Recent section */}
                {recentAssets.length > 0 && (
                    <>
                        <Dropdown.Header>Recent {label}s</Dropdown.Header>
                        {recentAssets.map((asset) => {
                            const isOpen = hasModalForAsset(asset.id);

                            return (
                                <Dropdown.Item
                                    key={asset.id}
                                    onClick={() =>
                                        handleOpenAsset(asset.id, asset.name)
                                    }
                                    className="d-flex justify-content-between align-items-center gap-2"
                                >
                                    <span className="text-truncate">
                                        {asset.name}
                                    </span>
                                    {isOpen && (
                                        <FontAwesomeIcon
                                            icon={icon}
                                            size="xs"
                                            className="text-muted"
                                            title="Currently open"
                                        />
                                    )}
                                </Dropdown.Item>
                            );
                        })}
                    </>
                )}

                {/* Empty state */}
                {count === 0 && recentAssets.length === 0 && (
                    <Dropdown.ItemText className="text-muted">
                        No {label.toLowerCase()}s
                    </Dropdown.ItemText>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};
