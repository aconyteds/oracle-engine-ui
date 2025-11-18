import { RecordType } from "@graphql";
import { signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";

export interface AssetModalState {
    modalId: string;
    assetId: string | null; // null for new assets
    assetType: RecordType;
    name: string;
    isMinimized: boolean;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
}

// Single source of truth: Map of modal ID to modal state
export const assetModalsSignal = signal<Map<string, AssetModalState>>(
    new Map()
);

// Helper to generate unique modal ID
const generateModalId = (assetType: RecordType, assetId: string | null) => {
    if (assetId) {
        // Existing assets: use assetId as the unique identifier (no timestamp)
        return `${assetType.toLowerCase()}-${assetId}`;
    }
    // New assets: include timestamp to allow multiple "New Asset" modals
    const timestamp = Date.now();
    return `${assetType.toLowerCase()}-new-${timestamp}`;
};

/**
 * Helper to find an existing modal by assetId
 */
const getModalByAssetId = (assetId: string): AssetModalState | undefined => {
    const modals = Array.from(assetModalsSignal.value.values());
    return modals.find((modal) => modal.assetId === assetId);
};

// Helper functions to manage asset modals
export const assetModalManager = {
    /**
     * Opens a modal for an asset. For existing assets (assetId provided),
     * returns the existing modal if already open and maximizes it if minimized.
     * For new assets (assetId is null), always creates a new modal to allow
     * multiple new assets to be created simultaneously.
     *
     * @param assetType - The type of asset (Plot, NPC, Location)
     * @param assetId - Unique asset ID, or null for new assets
     * @param name - Display name for the modal header
     * @returns The unique modal ID for subsequent operations
     */
    openModal: (
        assetType: RecordType,
        assetId: string | null = null,
        name: string = "New Asset"
    ): string => {
        // For existing assets, check if modal already exists
        if (assetId) {
            const existingModal = getModalByAssetId(assetId);
            if (existingModal) {
                // Modal already exists - maximize it if minimized
                if (existingModal.isMinimized) {
                    assetModalManager.maximizeModal(existingModal.modalId);
                }
                return existingModal.modalId;
            }
        }

        // Create new modal
        const modalId = generateModalId(assetType, assetId);
        const currentModals = new Map(assetModalsSignal.value);

        currentModals.set(modalId, {
            modalId,
            assetId,
            assetType,
            name,
            isMinimized: false,
        });

        assetModalsSignal.value = currentModals;
        return modalId;
    },

    /**
     * Closes a specific modal by its ID
     * @param modalId - The unique modal ID to close
     */
    closeModal: (modalId: string) => {
        const currentModals = new Map(assetModalsSignal.value);
        currentModals.delete(modalId);
        assetModalsSignal.value = currentModals;
    },

    /**
     * Minimizes a specific modal (hides it from view but keeps state)
     * @param modalId - The unique modal ID to minimize
     */
    minimizeModal: (modalId: string) => {
        const currentModals = new Map(assetModalsSignal.value);
        const modal = currentModals.get(modalId);
        if (modal) {
            currentModals.set(modalId, { ...modal, isMinimized: true });
            assetModalsSignal.value = currentModals;
        }
    },

    /**
     * Maximizes a specific modal (shows it if minimized)
     * @param modalId - The unique modal ID to maximize
     */
    maximizeModal: (modalId: string) => {
        const currentModals = new Map(assetModalsSignal.value);
        const modal = currentModals.get(modalId);
        if (modal) {
            currentModals.set(modalId, { ...modal, isMinimized: false });
            assetModalsSignal.value = currentModals;
        }
    },

    /**
     * Toggles the minimize state of a modal
     * @param modalId - The unique modal ID to toggle
     */
    toggleMinimize: (modalId: string) => {
        const currentModals = new Map(assetModalsSignal.value);
        const modal = currentModals.get(modalId);
        if (modal) {
            currentModals.set(modalId, {
                ...modal,
                isMinimized: !modal.isMinimized,
            });
            assetModalsSignal.value = currentModals;
        }
    },

    /**
     * Updates the display name of a modal (useful when saving a new asset)
     * @param modalId - The unique modal ID
     * @param name - New name to display in modal header
     */
    updateModalName: (modalId: string, name: string) => {
        const currentModals = new Map(assetModalsSignal.value);
        const modal = currentModals.get(modalId);
        if (modal) {
            currentModals.set(modalId, { ...modal, name });
            assetModalsSignal.value = currentModals;
        }
    },

    /**
     * Updates the position and/or size of a modal
     * @param modalId - The unique modal ID
     * @param position - Optional new position {x, y}
     * @param size - Optional new size {width, height}
     */
    updateModalTransform: (
        modalId: string,
        position?: { x: number; y: number },
        size?: { width: number; height: number }
    ) => {
        const currentModals = new Map(assetModalsSignal.value);
        const modal = currentModals.get(modalId);
        if (modal) {
            const updates: Partial<AssetModalState> = {};
            if (position !== undefined) updates.position = position;
            if (size !== undefined) updates.size = size;
            currentModals.set(modalId, { ...modal, ...updates });
            assetModalsSignal.value = currentModals;
        }
    },

    /**
     * Minimizes all currently open modals
     */
    minimizeAll: () => {
        const currentModals = new Map(assetModalsSignal.value);
        for (const [id, modal] of currentModals.entries()) {
            currentModals.set(id, { ...modal, isMinimized: true });
        }
        assetModalsSignal.value = currentModals;
    },

    /**
     * Closes all currently open modals
     */
    closeAll: () => {
        assetModalsSignal.value = new Map();
    },

    /**
     * Minimizes all modals of a specific asset type
     * @param assetType - The asset type to filter by
     */
    minimizeAllByType: (assetType: RecordType) => {
        const currentModals = new Map(assetModalsSignal.value);
        for (const [id, modal] of currentModals.entries()) {
            if (modal.assetType === assetType) {
                currentModals.set(id, { ...modal, isMinimized: true });
            }
        }
        assetModalsSignal.value = currentModals;
    },

    /**
     * Closes all modals of a specific asset type
     * @param assetType - The asset type to filter by
     */
    closeAllByType: (assetType: RecordType) => {
        const currentModals = new Map(assetModalsSignal.value);
        for (const [id, modal] of currentModals.entries()) {
            if (modal.assetType === assetType) {
                currentModals.delete(id);
            }
        }
        assetModalsSignal.value = currentModals;
    },

    /**
     * Maximizes all modals of a specific asset type
     * @param assetType - The asset type to filter by
     */
    maximizeAllByType: (assetType: RecordType) => {
        const currentModals = new Map(assetModalsSignal.value);
        for (const [id, modal] of currentModals.entries()) {
            if (modal.assetType === assetType) {
                currentModals.set(id, { ...modal, isMinimized: false });
            }
        }
        assetModalsSignal.value = currentModals;
    },

    /**
     * Gets all modals of a specific asset type
     * @param assetType - The asset type to filter by
     * @returns Array of modal states matching the asset type
     */
    getModalsByType: (assetType: RecordType): AssetModalState[] => {
        const modals = Array.from(assetModalsSignal.value.values());
        return modals.filter((modal) => modal.assetType === assetType);
    },

    /**
     * Gets all currently open modals
     * @returns Array of all modal states
     */
    getAllModals: (): AssetModalState[] => {
        return Array.from(assetModalsSignal.value.values());
    },

    /**
     * Gets a specific modal by its asset ID
     * @param assetId - The asset ID to search for
     * @returns The modal state if found, undefined otherwise
     */
    getModalByAssetId: (assetId: string): AssetModalState | undefined => {
        return getModalByAssetId(assetId);
    },

    /**
     * Checks if a modal exists for a given asset ID
     * @param assetId - The asset ID to check
     * @returns True if a modal exists for this asset
     */
    hasModalForAsset: (assetId: string): boolean => {
        const modals = Array.from(assetModalsSignal.value.values());
        return modals.some((modal) => modal.assetId === assetId);
    },
};

/**
 * Hook to use asset modal management with signal reactivity.
 * This hook enables automatic re-rendering when modal state changes.
 *
 * @returns Object containing all modal management functions and reactive state
 */
export const useAssetModals = () => {
    // IMPORTANT: Must be called at top level to enable signal reactivity
    // This ensures components re-render when the signal changes
    useSignals();

    // Get all modals (reactive) - accessing .value triggers signal tracking
    const allModals = Array.from(assetModalsSignal.value.values());

    // Get modals by type (reactive)
    // Don't use useCallback here - we want this to be re-evaluated on each render
    // so it picks up the latest signal value
    const getModalsByType = (assetType: RecordType) => {
        const modals = Array.from(assetModalsSignal.value.values());
        return modals.filter((modal) => modal.assetType === assetType);
    };

    // Get modal by asset ID (reactive)
    const getModalByAssetId = (
        assetId: string
    ): AssetModalState | undefined => {
        const modals = Array.from(assetModalsSignal.value.values());
        return modals.find((modal) => modal.assetId === assetId);
    };

    // Check if a modal exists for an asset (reactive)
    const hasModalForAsset = (assetId: string): boolean => {
        const modals = Array.from(assetModalsSignal.value.values());
        return modals.some((modal) => modal.assetId === assetId);
    };

    return {
        modals: allModals,
        getModalsByType,
        getModalByAssetId,
        openModal: assetModalManager.openModal,
        closeModal: assetModalManager.closeModal,
        minimizeModal: assetModalManager.minimizeModal,
        maximizeModal: assetModalManager.maximizeModal,
        toggleMinimize: assetModalManager.toggleMinimize,
        updateModalName: assetModalManager.updateModalName,
        minimizeAll: assetModalManager.minimizeAll,
        closeAll: assetModalManager.closeAll,
        minimizeAllByType: assetModalManager.minimizeAllByType,
        closeAllByType: assetModalManager.closeAllByType,
        maximizeAllByType: assetModalManager.maximizeAllByType,
        hasModalForAsset,
    };
};
