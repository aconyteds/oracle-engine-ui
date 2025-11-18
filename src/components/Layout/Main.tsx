import { useAssetModals } from "@signals";
import React from "react";
import "./Main.scss";
import { AssetModal } from "../CampaignAsset";

export const Main: React.FC = () => {
    const { modals } = useAssetModals();

    return (
        <div className="display-area">
            <div className="display-content">
                {/* Render all open asset modals */}
                {modals.map((modalState) => {
                    // Render the appropriate modal component based on asset type
                    return (
                        <AssetModal
                            modalState={modalState}
                            key={modalState.modalId}
                        />
                    );
                })}
            </div>
        </div>
    );
};
