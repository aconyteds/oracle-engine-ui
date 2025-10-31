import React, { useState } from "react";
import { DraggableModal, type AssetType } from "./DraggableModal";

/**
 * Example component demonstrating DraggableModal usage
 * This file is for development and testing purposes only
 */
export const DraggableModalExample: React.FC = () => {
    const [modals, setModals] = useState<
        Array<{
            id: string;
            assetType: AssetType;
            assetId?: string;
            x: number;
            y: number;
        }>
    >([]);

    const addModal = (assetType: AssetType, assetId?: string) => {
        const newModal = {
            id: `modal-${Date.now()}`,
            assetType,
            assetId,
            x: 100 + modals.length * 50,
            y: 100 + modals.length * 50,
        };
        setModals([...modals, newModal]);
    };

    const removeModal = (id: string) => {
        setModals(modals.filter((m) => m.id !== id));
    };

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                position: "relative",
                background: "#f5f5f5",
                padding: "20px",
            }}
        >
            <div style={{ marginBottom: "20px" }}>
                <h2>DraggableModal Examples</h2>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => addModal("NPC", "Bonesaw")}
                    >
                        Add NPC Modal
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => addModal("Location", "Bonesaw's Lair")}
                    >
                        Add Location Modal
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => addModal("POI", "Main Cage Arena")}
                    >
                        Add POI Modal
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                            addModal("PLOT", "Bonesaw Wrestling Match")
                        }
                    >
                        Add PLOT Modal
                    </button>
                </div>
            </div>

            <div
                style={{
                    position: "relative",
                    width: "calc(100% - 40px)",
                    height: "calc(100% - 120px)",
                    border: "2px dashed #ccc",
                    background: "white",
                }}
            >
                {modals.map((modal) => (
                    <DraggableModal
                        key={modal.id}
                        assetType={modal.assetType}
                        id={modal.assetId}
                        initialX={modal.x}
                        initialY={modal.y}
                        onClose={() => removeModal(modal.id)}
                    />
                ))}
            </div>
        </div>
    );
};
