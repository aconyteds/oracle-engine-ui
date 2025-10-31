import { signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useEffect } from "react";

const BASE_Z_INDEX = 20;

// Single source of truth: array of modal IDs in activation order (oldest first)
export const modalOrderSignal = signal<string[]>([]);

// Helper functions to manage modal order
export const modalZIndexManager = {
    // Bring modal to front (or register if new)
    bringToFront: (modalId: string) => {
        const currentOrder = modalOrderSignal.value;
        // Remove modal if it exists, then add to end (highest z-index)
        const filtered = currentOrder.filter((id) => id !== modalId);
        modalOrderSignal.value = [...filtered, modalId];
    },

    // Remove modal from tracking
    remove: (modalId: string) => {
        modalOrderSignal.value = modalOrderSignal.value.filter(
            (id) => id !== modalId
        );
    },

    // Get z-index for a modal
    getZIndex: (modalId: string): number => {
        const index = modalOrderSignal.value.indexOf(modalId);
        if (index === -1) return BASE_Z_INDEX;
        return BASE_Z_INDEX + index;
    },
};

/**
 * Hook to manage modal z-index using signals.
 * Call this in your modal component to:
 * 1. Register the modal when it mounts
 * 2. Get the current z-index (reactive)
 * 3. Get a function to bring the modal to front
 */
export const useModalZIndex = (modalId: string) => {
    // CRITICAL: Enable signal tracking in this component
    // This makes the component re-render when signals change
    useSignals();

    // Register modal on mount and bring to front
    // Unregister on unmount
    useEffect(() => {
        modalZIndexManager.bringToFront(modalId);
        return () => modalZIndexManager.remove(modalId);
    }, [modalId]);

    // Calculate z-index reactively
    // Because we called useSignals(), accessing modalOrderSignal.value
    // will cause this component to re-render when the signal changes
    const zIndex = modalZIndexManager.getZIndex(modalId);

    const bringToFront = useCallback(
        () => modalZIndexManager.bringToFront(modalId),
        [modalId]
    );

    return {
        zIndex,
        bringToFront,
    };
};
