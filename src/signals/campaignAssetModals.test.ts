import { RecordType } from "@graphql";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
    assetModalManager,
    assetModalsSignal,
    useAssetModals,
} from "./campaignAssetModals";

describe("campaignAssetModals", () => {
    beforeEach(() => {
        // Reset signal state before each test
        assetModalsSignal.value = new Map();
    });

    afterEach(() => {
        // Clean up after each test
        assetModalsSignal.value = new Map();
    });

    describe("assetModalManager.openModal", () => {
        test("should create new modal with generated ID", () => {
            const modalId = assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            expect(modalId).toBe("plot-asset-123");

            const modals = Array.from(assetModalsSignal.value.values());
            expect(modals).toHaveLength(1);
            expect(modals[0]).toEqual({
                modalId: "plot-asset-123",
                assetId: "asset-123",
                assetType: RecordType.Plot,
                name: "Test Plot",
                isMinimized: false,
            });
        });

        test("should create new asset modal with timestamp in ID", () => {
            const modalId = assetModalManager.openModal(
                RecordType.Plot,
                null,
                "New Asset"
            );

            expect(modalId).toMatch(/^plot-new-\d+$/);

            const modals = Array.from(assetModalsSignal.value.values());
            expect(modals).toHaveLength(1);
            expect(modals[0].assetId).toBe(null);
            expect(modals[0].name).toBe("New Asset");
        });

        test("should allow multiple new asset modals simultaneously", async () => {
            const modalId1 = assetModalManager.openModal(
                RecordType.Plot,
                null,
                "New Asset"
            );

            // Wait 1ms to ensure different timestamp
            await new Promise((resolve) => setTimeout(resolve, 1));

            const modalId2 = assetModalManager.openModal(
                RecordType.Plot,
                null,
                "New Asset"
            );

            expect(modalId1).not.toBe(modalId2);

            const modals = Array.from(assetModalsSignal.value.values());
            expect(modals).toHaveLength(2);
        });

        test("should reuse existing modal for same assetId", () => {
            const modalId1 = assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );
            const modalId2 = assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            expect(modalId1).toBe(modalId2);

            const modals = Array.from(assetModalsSignal.value.values());
            expect(modals).toHaveLength(1);
        });

        test("should maximize minimized modal when reopening", () => {
            const modalId = assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            // Minimize it
            assetModalManager.minimizeModal(modalId);

            let modal = assetModalsSignal.value.get(modalId);
            expect(modal?.isMinimized).toBe(true);

            // Try to open again
            assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            modal = assetModalsSignal.value.get(modalId);
            expect(modal?.isMinimized).toBe(false);
        });
    });

    describe("assetModalManager.closeModal", () => {
        test("should remove modal from state", () => {
            const modalId = assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            assetModalManager.closeModal(modalId);

            const modals = Array.from(assetModalsSignal.value.values());
            expect(modals).toHaveLength(0);
        });

        test("should handle closing non-existent modal gracefully", () => {
            assetModalManager.closeModal("non-existent-id");

            const modals = Array.from(assetModalsSignal.value.values());
            expect(modals).toHaveLength(0);
        });
    });

    describe("assetModalManager.minimizeModal", () => {
        test("should set isMinimized to true", () => {
            const modalId = assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            assetModalManager.minimizeModal(modalId);

            const modal = assetModalsSignal.value.get(modalId);
            expect(modal?.isMinimized).toBe(true);
        });

        test("should handle minimizing non-existent modal gracefully", () => {
            assetModalManager.minimizeModal("non-existent-id");

            const modals = Array.from(assetModalsSignal.value.values());
            expect(modals).toHaveLength(0);
        });
    });

    describe("assetModalManager.maximizeModal", () => {
        test("should set isMinimized to false", () => {
            const modalId = assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            assetModalManager.minimizeModal(modalId);
            assetModalManager.maximizeModal(modalId);

            const modal = assetModalsSignal.value.get(modalId);
            expect(modal?.isMinimized).toBe(false);
        });
    });

    describe("assetModalManager.toggleMinimize", () => {
        test("should toggle isMinimized state", () => {
            const modalId = assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            let modal = assetModalsSignal.value.get(modalId);
            expect(modal?.isMinimized).toBe(false);

            assetModalManager.toggleMinimize(modalId);
            modal = assetModalsSignal.value.get(modalId);
            expect(modal?.isMinimized).toBe(true);

            assetModalManager.toggleMinimize(modalId);
            modal = assetModalsSignal.value.get(modalId);
            expect(modal?.isMinimized).toBe(false);
        });
    });

    describe("assetModalManager.updateModalName", () => {
        test("should update modal name", () => {
            const modalId = assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Original Name"
            );

            assetModalManager.updateModalName(modalId, "Updated Name");

            const modal = assetModalsSignal.value.get(modalId);
            expect(modal?.name).toBe("Updated Name");
        });
    });

    describe("assetModalManager.updateModalTransform", () => {
        test("should update position", () => {
            const modalId = assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            assetModalManager.updateModalTransform(modalId, {
                x: 100,
                y: 200,
            });

            const modal = assetModalsSignal.value.get(modalId);
            expect(modal?.position).toEqual({ x: 100, y: 200 });
        });

        test("should update size", () => {
            const modalId = assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            assetModalManager.updateModalTransform(modalId, undefined, {
                width: 800,
                height: 600,
            });

            const modal = assetModalsSignal.value.get(modalId);
            expect(modal?.size).toEqual({ width: 800, height: 600 });
        });

        test("should update both position and size", () => {
            const modalId = assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            assetModalManager.updateModalTransform(
                modalId,
                { x: 100, y: 200 },
                { width: 800, height: 600 }
            );

            const modal = assetModalsSignal.value.get(modalId);
            expect(modal?.position).toEqual({ x: 100, y: 200 });
            expect(modal?.size).toEqual({ width: 800, height: 600 });
        });
    });

    describe("assetModalManager.minimizeAll", () => {
        test("should minimize all open modals", () => {
            const modalId1 = assetModalManager.openModal(
                RecordType.Plot,
                "asset-1",
                "Plot 1"
            );
            const modalId2 = assetModalManager.openModal(
                RecordType.Plot,
                "asset-2",
                "Plot 2"
            );

            assetModalManager.minimizeAll();

            const modal1 = assetModalsSignal.value.get(modalId1);
            const modal2 = assetModalsSignal.value.get(modalId2);

            expect(modal1?.isMinimized).toBe(true);
            expect(modal2?.isMinimized).toBe(true);
        });
    });

    describe("assetModalManager.closeAll", () => {
        test("should close all open modals", () => {
            assetModalManager.openModal(RecordType.Plot, "asset-1", "Plot 1");
            assetModalManager.openModal(RecordType.Plot, "asset-2", "Plot 2");

            assetModalManager.closeAll();

            const modals = Array.from(assetModalsSignal.value.values());
            expect(modals).toHaveLength(0);
        });
    });

    describe("assetModalManager.minimizeAllByType", () => {
        test("should minimize only modals of specified type", () => {
            const plotId = assetModalManager.openModal(
                RecordType.Plot,
                "asset-1",
                "Plot 1"
            );
            const npcId = assetModalManager.openModal(
                RecordType.Npc,
                "asset-2",
                "NPC 1"
            );

            assetModalManager.minimizeAllByType(RecordType.Plot);

            const plotModal = assetModalsSignal.value.get(plotId);
            const npcModal = assetModalsSignal.value.get(npcId);

            expect(plotModal?.isMinimized).toBe(true);
            expect(npcModal?.isMinimized).toBe(false);
        });
    });

    describe("assetModalManager.closeAllByType", () => {
        test("should close only modals of specified type", () => {
            assetModalManager.openModal(RecordType.Plot, "asset-1", "Plot 1");
            const npcId = assetModalManager.openModal(
                RecordType.Npc,
                "asset-2",
                "NPC 1"
            );

            assetModalManager.closeAllByType(RecordType.Plot);

            const modals = Array.from(assetModalsSignal.value.values());
            expect(modals).toHaveLength(1);
            expect(modals[0].modalId).toBe(npcId);
        });
    });

    describe("assetModalManager.maximizeAllByType", () => {
        test("should maximize only modals of specified type", () => {
            const plotId = assetModalManager.openModal(
                RecordType.Plot,
                "asset-1",
                "Plot 1"
            );
            const npcId = assetModalManager.openModal(
                RecordType.Npc,
                "asset-2",
                "NPC 1"
            );

            assetModalManager.minimizeAll();
            assetModalManager.maximizeAllByType(RecordType.Plot);

            const plotModal = assetModalsSignal.value.get(plotId);
            const npcModal = assetModalsSignal.value.get(npcId);

            expect(plotModal?.isMinimized).toBe(false);
            expect(npcModal?.isMinimized).toBe(true);
        });
    });

    describe("assetModalManager.getModalsByType", () => {
        test("should return modals of specified type", () => {
            assetModalManager.openModal(RecordType.Plot, "asset-1", "Plot 1");
            assetModalManager.openModal(RecordType.Plot, "asset-2", "Plot 2");
            assetModalManager.openModal(RecordType.Npc, "asset-3", "NPC 1");

            const plotModals = assetModalManager.getModalsByType(
                RecordType.Plot
            );

            expect(plotModals).toHaveLength(2);
            expect(
                plotModals.every((m) => m.assetType === RecordType.Plot)
            ).toBe(true);
        });
    });

    describe("assetModalManager.getAllModals", () => {
        test("should return all modals", () => {
            assetModalManager.openModal(RecordType.Plot, "asset-1", "Plot 1");
            assetModalManager.openModal(RecordType.Npc, "asset-2", "NPC 1");

            const allModals = assetModalManager.getAllModals();

            expect(allModals).toHaveLength(2);
        });
    });

    describe("assetModalManager.getModalByAssetId", () => {
        test("should return modal for given asset ID", () => {
            assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            const modal = assetModalManager.getModalByAssetId("asset-123");

            expect(modal).toBeDefined();
            expect(modal?.assetId).toBe("asset-123");
        });

        test("should return undefined for non-existent asset ID", () => {
            const modal = assetModalManager.getModalByAssetId("non-existent");

            expect(modal).toBeUndefined();
        });
    });

    describe("assetModalManager.hasModalForAsset", () => {
        test("should return true when modal exists for asset", () => {
            assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            const hasModal = assetModalManager.hasModalForAsset("asset-123");

            expect(hasModal).toBe(true);
        });

        test("should return false when no modal exists for asset", () => {
            const hasModal = assetModalManager.hasModalForAsset("non-existent");

            expect(hasModal).toBe(false);
        });
    });

    describe("useAssetModals hook", () => {
        test("should return all modals", () => {
            assetModalManager.openModal(RecordType.Plot, "asset-1", "Plot 1");
            assetModalManager.openModal(RecordType.Npc, "asset-2", "NPC 1");

            const { result } = renderHook(() => useAssetModals());

            expect(result.current.modals).toHaveLength(2);
        });

        test("should expose all manager functions", () => {
            const { result } = renderHook(() => useAssetModals());

            expect(typeof result.current.openModal).toBe("function");
            expect(typeof result.current.closeModal).toBe("function");
            expect(typeof result.current.minimizeModal).toBe("function");
            expect(typeof result.current.maximizeModal).toBe("function");
            expect(typeof result.current.toggleMinimize).toBe("function");
            expect(typeof result.current.updateModalName).toBe("function");
            expect(typeof result.current.minimizeAll).toBe("function");
            expect(typeof result.current.closeAll).toBe("function");
            expect(typeof result.current.minimizeAllByType).toBe("function");
            expect(typeof result.current.closeAllByType).toBe("function");
            expect(typeof result.current.maximizeAllByType).toBe("function");
            expect(typeof result.current.getModalsByType).toBe("function");
            expect(typeof result.current.getModalByAssetId).toBe("function");
            expect(typeof result.current.hasModalForAsset).toBe("function");
        });

        test("should provide reactive getModalsByType", () => {
            assetModalManager.openModal(RecordType.Plot, "asset-1", "Plot 1");
            assetModalManager.openModal(RecordType.Npc, "asset-2", "NPC 1");

            const { result } = renderHook(() => useAssetModals());

            const plotModals = result.current.getModalsByType(RecordType.Plot);
            expect(plotModals).toHaveLength(1);
            expect(plotModals[0].assetType).toBe(RecordType.Plot);
        });

        test("should provide reactive getModalByAssetId", () => {
            assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            const { result } = renderHook(() => useAssetModals());

            const modal = result.current.getModalByAssetId("asset-123");
            expect(modal).toBeDefined();
            expect(modal?.assetId).toBe("asset-123");
        });

        test("should provide reactive hasModalForAsset", () => {
            assetModalManager.openModal(
                RecordType.Plot,
                "asset-123",
                "Test Plot"
            );

            const { result } = renderHook(() => useAssetModals());

            expect(result.current.hasModalForAsset("asset-123")).toBe(true);
            expect(result.current.hasModalForAsset("non-existent")).toBe(false);
        });
    });
});
