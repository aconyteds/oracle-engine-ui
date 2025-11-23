import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAssetModals } from "@signals";
import React, { useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import "./AssetManager.scss";
import { RecordType } from "@graphql";
import { useCampaignContext } from "../../contexts";
import { AssetTypeMenu } from "./AssetTypeMenu";
import { ASSET_TYPE_ICONS } from "./models";

export const AssetManager: React.FC = () => {
    const { selectedCampaign } = useCampaignContext();
    const { getModalsByType, closeAll } = useAssetModals();

    // biome-ignore lint/correctness/useExhaustiveDependencies: Close all modals when campaign changes
    useEffect(() => {
        // Close all modals when campaign changes
        closeAll();
    }, [selectedCampaign]);

    // Group modals by type - don't use useMemo to allow signal reactivity
    const modalsByType = {
        Plot: getModalsByType(RecordType.Plot),
        Npc: getModalsByType(RecordType.NPC),
        Location: getModalsByType(RecordType.Location),
    };

    // Count modals by type
    const counts = {
        Plot: modalsByType.Plot.length,
        Npc: modalsByType.Npc.length,
        Location: modalsByType.Location.length,
    };

    const totalModals = counts.Plot + counts.Npc + counts.Location;

    return (
        <div className="asset-manager">
            <Dropdown autoClose="outside">
                <Dropdown.Toggle
                    variant="outline-primary"
                    size="sm"
                    id="asset-manager-dropdown"
                    className="asset-toggle d-flex align-items-center gap-2"
                    bsPrefix="btn"
                >
                    Manage Assets
                    {totalModals > 0 && (
                        <span className="badge bg-primary">{totalModals}</span>
                    )}
                    <FontAwesomeIcon icon={faChevronDown} size="xs" />
                </Dropdown.Toggle>

                <Dropdown.Menu className="asset-manager-menu">
                    {/* Asset type sections with submenus */}
                    <AssetTypeMenu
                        assetType={RecordType.NPC}
                        label="NPC"
                        icon={ASSET_TYPE_ICONS.NPC}
                    />
                    <AssetTypeMenu
                        assetType={RecordType.Location}
                        label="POI"
                        icon={ASSET_TYPE_ICONS.Location}
                    />
                    <AssetTypeMenu
                        assetType={RecordType.Plot}
                        label="Plot"
                        icon={ASSET_TYPE_ICONS.Plot}
                    />
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};
