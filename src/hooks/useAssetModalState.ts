import {
    CampaignAssetVersionFragment,
    FullCampaignAssetDetailsFragment,
    RecordType,
    useGetCampaignAssetQuery,
} from "@graphql";
import { assetModalManager, subscribeToAssetStale } from "@signals";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    assetToFormData,
    createDefaultFormData,
    isFormDataEqual,
    validateFormData,
} from "../components/CampaignAsset";
import type { AssetFormData } from "../components/CampaignAsset/types";

export interface UseAssetModalStateOptions {
    /** The asset ID, or null for new assets */
    assetId: string | null;
    /** The type of asset (Plot, NPC, Location) */
    assetType: RecordType;
    /** The unique modal ID */
    modalId: string;
    /** Initial name for display (used for new assets) */
    initialName: string;
    /** Whether the modal is marked as stale from external state */
    isStale: boolean;
}

export interface UseAssetModalStateReturn {
    /** Server data from GraphQL query */
    serverData: FullCampaignAssetDetailsFragment | null;
    /** Current form data (what the user sees/edits) */
    formData: AssetFormData;
    /** Whether form data differs from server data */
    isDirty: boolean;
    /** Whether the asset was modified externally */
    isStale: boolean;
    /** Whether form data is valid (name is required) */
    isValid: boolean;
    /** Whether a reset/reload operation is in progress */
    isResetting: boolean;
    /** Update a single field in the form */
    setFormField: <T extends AssetFormData, K extends keyof T>(
        field: K,
        value: T[K]
    ) => void;
    /** Reload data from server, discarding local changes */
    handleReload: () => Promise<void>;
    /** Called after a successful save to sync form with new server data */
    handleSaveComplete: () => Promise<void>;
    /** Refetch data from server */
    refetch: () => Promise<void>;
    /** Previous versions of the asset for version history */
    versionHistory: Array<CampaignAssetVersionFragment>;
}

/**
 * Custom hook for managing AssetModal state
 *
 * This hook is the single source of truth for asset data in the modal.
 * It manages:
 * - Server data from GraphQL
 * - Local form state
 * - Dirty/stale detection
 * - Race condition prevention via isResetting flag
 */
export function useAssetModalState(
    options: UseAssetModalStateOptions
): UseAssetModalStateReturn {
    const { assetId, assetType, modalId, initialName, isStale } = options;

    // Fetch asset data from server
    const {
        data: assetData,
        refetch: refetchQuery,
        loading,
    } = useGetCampaignAssetQuery({
        variables: { input: { assetId: assetId || "" } },
        skip: !assetId,
        fetchPolicy: "network-only",
    });

    const serverData = assetData?.getCampaignAsset?.asset ?? null;

    // Form state - what the user sees and edits
    const [formData, setFormData] = useState<AssetFormData>(() => {
        // Initialize with defaults for new assets
        const name = initialName === "New Asset" ? "" : initialName;
        return createDefaultFormData(assetType, name);
    });

    // Loading/reset state to prevent race conditions
    const [isResetting, setIsResetting] = useState(false);

    // Track if we've initialized from server data
    const [hasInitialized, setHasInitialized] = useState(false);

    // Track if user has manually edited the form (distinct from derived dirty state)
    // This prevents auto-sync from clobbering user changes
    const [userHasEdited, setUserHasEdited] = useState(false);

    // Derive dirty state by comparing form data to server data
    const isDirty = useMemo(() => {
        if (!serverData) {
            // For new assets, check if anything beyond name has been filled
            const defaultData = createDefaultFormData(assetType, formData.name);
            return !isFormDataEqual(formData, defaultData);
        }

        const serverFormData = assetToFormData(serverData, assetType);
        return !isFormDataEqual(formData, serverFormData);
    }, [formData, serverData, assetType]);

    // Validate form data
    const isValid = useMemo(() => validateFormData(formData), [formData]);

    // Initialize form from server data when it first loads
    useEffect(() => {
        if (!serverData || hasInitialized || loading) return;

        const newFormData = assetToFormData(serverData, assetType);
        setFormData(newFormData);
        setHasInitialized(true);
    }, [serverData, assetType, hasInitialized, loading]);

    // Auto-sync form when server data changes AND user hasn't edited AND not resetting
    // biome-ignore lint/correctness/useExhaustiveDependencies: We only want to trigger on serverData changes
    useEffect(() => {
        // Skip if no server data, or still loading, or haven't initialized yet
        if (!serverData || loading || !hasInitialized) return;

        // Skip if user has manually edited or we're in a reset operation
        if (userHasEdited || isResetting) return;

        // Server data changed and user hasn't edited - sync form
        const newFormData = assetToFormData(serverData, assetType);
        if (!isFormDataEqual(formData, newFormData)) {
            setFormData(newFormData);
        }
    }, [
        serverData,
        assetType,
        userHasEdited,
        isResetting,
        loading,
        hasInitialized,
    ]);

    // Subscribe to stale notifications with debouncing to prevent rapid-fire refetches
    const staleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!assetId) return;

        const unsubscribe = subscribeToAssetStale(assetId, () => {
            // Clear any pending debounced refetch
            if (staleTimeoutRef.current) {
                clearTimeout(staleTimeoutRef.current);
            }

            if (userHasEdited) {
                // User has edited the form - mark as stale to show warning
                assetModalManager.markAssetStale(assetId);
            } else {
                // Form is clean - debounce auto-reload to prevent rapid-fire refetches
                staleTimeoutRef.current = setTimeout(() => {
                    refetchQuery();
                    staleTimeoutRef.current = null;
                }, 300);
            }
        });

        return () => {
            unsubscribe();
            // Clean up pending timeout on unmount
            if (staleTimeoutRef.current) {
                clearTimeout(staleTimeoutRef.current);
            }
        };
    }, [assetId, userHasEdited, refetchQuery]);

    // Update a single field
    const setFormField = useCallback(
        <T extends AssetFormData, K extends keyof T>(field: K, value: T[K]) => {
            setUserHasEdited(true);
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        },
        []
    );

    // Reload handler - discards local changes and syncs with server
    const handleReload = useCallback(async () => {
        if (!assetId) return;

        setIsResetting(true);
        try {
            const result = await refetchQuery();
            const asset = result.data?.getCampaignAsset?.asset;

            if (asset) {
                // Force update form data from server
                const newFormData = assetToFormData(asset, assetType);
                setFormData(newFormData);

                // Sync modal name with server data
                if (asset.name) {
                    assetModalManager.updateModalName(modalId, asset.name);
                }
            }

            // Reset edit tracking since we've synced with server
            setUserHasEdited(false);
            assetModalManager.clearStaleFlag(modalId);
        } finally {
            setIsResetting(false);
        }
    }, [assetId, assetType, modalId, refetchQuery]);

    // Called after successful save to sync with new server data
    const handleSaveComplete = useCallback(async () => {
        setIsResetting(true);
        try {
            const result = await refetchQuery();
            const asset = result.data?.getCampaignAsset?.asset;

            if (asset) {
                // Sync form data with what server now has
                const newFormData = assetToFormData(asset, assetType);
                setFormData(newFormData);
            }

            // Reset edit tracking since we've synced with server
            setUserHasEdited(false);
        } finally {
            setIsResetting(false);
        }
    }, [assetType, refetchQuery]);

    // Refetch wrapper
    const refetch = useCallback(async () => {
        await refetchQuery();
    }, [refetchQuery]);

    return {
        serverData,
        formData,
        isDirty,
        isStale,
        isValid,
        isResetting,
        setFormField,
        handleReload,
        handleSaveComplete,
        refetch,
        versionHistory: serverData?.versions || [],
    };
}
