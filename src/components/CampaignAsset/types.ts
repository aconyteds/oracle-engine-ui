import { PlotStatus, Urgency } from "@graphql";

/**
 * Base form data shared by all asset types
 */
export interface BaseAssetFormData {
    name: string;
    gmSummary: string;
    playerSummary: string;
    gmNotes: string;
    playerNotes: string;
}

/**
 * Form data for Plot assets
 */
export interface PlotFormData extends BaseAssetFormData {
    status: PlotStatus;
    urgency: Urgency;
}

/**
 * Form data for NPC assets
 */
export interface NPCFormData extends BaseAssetFormData {
    physicalDescription: string;
    motivation: string;
    mannerisms: string;
}

/**
 * Form data for Location assets
 */
export interface LocationFormData extends BaseAssetFormData {
    description: string;
    condition: string;
    characters: string;
    pointsOfInterest: string;
}

/**
 * Union type for all form data types
 */
export type AssetFormData = PlotFormData | NPCFormData | LocationFormData;

/**
 * Props interface for form components
 * Forms receive data via props and report changes upward
 */
export interface AssetFormProps<T extends AssetFormData> {
    /** The current form data to display */
    formData: T;
    /** Callback when a field value changes */
    onChange: <K extends keyof T>(field: K, value: T[K]) => void;
    /** Whether the form inputs should be disabled */
    disabled?: boolean;
}

/**
 * Type guard to check if form data is PlotFormData
 */
export function isPlotFormData(data: AssetFormData): data is PlotFormData {
    return "status" in data && "urgency" in data;
}

/**
 * Type guard to check if form data is NPCFormData
 */
export function isNPCFormData(data: AssetFormData): data is NPCFormData {
    return (
        "physicalDescription" in data &&
        "motivation" in data &&
        "mannerisms" in data
    );
}

/**
 * Type guard to check if form data is LocationFormData
 */
export function isLocationFormData(
    data: AssetFormData
): data is LocationFormData {
    return (
        "description" in data &&
        "condition" in data &&
        "characters" in data &&
        "pointsOfInterest" in data
    );
}
