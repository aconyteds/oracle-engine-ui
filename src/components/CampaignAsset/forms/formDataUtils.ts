import {
    FullCampaignAssetDetailsFragment,
    LocationDataFieldsFragment,
    NpcDataFieldsFragment,
    PlotDataFieldsFragment,
    PlotStatus,
    RecordType,
    Urgency,
} from "@graphql";
import type {
    AssetFormData,
    LocationFormData,
    NPCFormData,
    PlotFormData,
} from "../types";

/**
 * Create default form data for a new asset based on asset type
 */
export function createDefaultFormData(
    assetType: RecordType,
    initialName: string = ""
): AssetFormData {
    const baseData = {
        name: initialName,
        gmSummary: "",
        playerSummary: "",
        gmNotes: "",
        playerNotes: "",
    };

    switch (assetType) {
        case RecordType.Plot:
            return {
                ...baseData,
                status: PlotStatus.Rumored,
                urgency: Urgency.Ongoing,
            } as PlotFormData;

        case RecordType.Npc:
            return {
                ...baseData,
                physicalDescription: "",
                motivation: "",
                mannerisms: "",
            } as NPCFormData;

        case RecordType.Location:
            return {
                ...baseData,
                description: "",
                condition: "",
                characters: "",
                pointsOfInterest: "",
            } as LocationFormData;

        default:
            throw new Error(`Unknown asset type: ${assetType}`);
    }
}

/**
 * Convert server asset data to form data based on asset type
 */
export function assetToFormData(
    asset: FullCampaignAssetDetailsFragment,
    assetType: RecordType
): AssetFormData {
    const baseData = {
        name: asset.name || "",
        gmSummary: asset.gmSummary || "",
        playerSummary: asset.playerSummary || "",
        gmNotes: asset.gmNotes || "",
        playerNotes: asset.playerNotes || "",
    };

    switch (assetType) {
        case RecordType.Plot: {
            const plotData = asset.data as PlotDataFieldsFragment | null;
            return {
                ...baseData,
                status: plotData?.status || PlotStatus.Rumored,
                urgency: plotData?.urgency || Urgency.Ongoing,
            } as PlotFormData;
        }

        case RecordType.Npc: {
            const npcData = asset.data as NpcDataFieldsFragment | null;
            return {
                ...baseData,
                physicalDescription: npcData?.physicalDescription || "",
                motivation: npcData?.motivation || "",
                mannerisms: npcData?.mannerisms || "",
            } as NPCFormData;
        }

        case RecordType.Location: {
            const locationData =
                asset.data as LocationDataFieldsFragment | null;
            return {
                ...baseData,
                description: locationData?.description || "",
                condition: locationData?.condition || "",
                characters: locationData?.characters || "",
                pointsOfInterest: locationData?.pointsOfInterest || "",
            } as LocationFormData;
        }

        default:
            throw new Error(`Unknown asset type: ${assetType}`);
    }
}

/**
 * Deep equality comparison for form data to determine dirty state
 * Returns true if the two form data objects are equal (not dirty)
 */
export function isFormDataEqual(
    a: AssetFormData | null,
    b: AssetFormData | null
): boolean {
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;

    // Compare all keys from both objects
    const keysA = Object.keys(a) as (keyof AssetFormData)[];
    const keysB = Object.keys(b) as (keyof AssetFormData)[];

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (a[key] !== b[key]) return false;
    }

    return true;
}

/**
 * Validate form data - checks required fields
 * Returns true if form data is valid
 */
export function validateFormData(formData: AssetFormData): boolean {
    // Name is required for all asset types
    return !!formData.name && formData.name.trim().length > 0;
}
