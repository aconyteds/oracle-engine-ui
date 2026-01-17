import { PlotStatus, Urgency } from "@graphql";

/**
 * Format PlotStatus enum for display
 */
export const formatPlotStatus = (status: PlotStatus): string => {
    switch (status) {
        case PlotStatus.Closed:
            return "Completed";
        case PlotStatus.InProgress:
            return "In Progress";
        case PlotStatus.WillNotDo:
            return "Will Not Do";
        case PlotStatus.Rumored:
            return "Rumored";
        case PlotStatus.Unknown:
        default:
            return "Unknown";
    }
};

/**
 * Get badge variant for PlotStatus
 */
export const getPlotStatusVariant = (status: PlotStatus): string => {
    switch (status) {
        case PlotStatus.Closed:
            return "success";
        case PlotStatus.InProgress:
            return "primary";
        case PlotStatus.WillNotDo:
            return "secondary";
        case PlotStatus.Rumored:
            return "info";
        case PlotStatus.Unknown:
        default:
            return "secondary";
    }
};

/**
 * Get badge variant for Urgency
 */
export const getUrgencyVariant = (urgency: Urgency): string => {
    switch (urgency) {
        case Urgency.Critical:
            return "danger";
        case Urgency.Ongoing:
            return "warning";
        case Urgency.Resolved:
            return "success";
        default:
            return "secondary";
    }
};

/**
 * Status options for PlotForm select dropdown
 */
export const PLOT_STATUS_OPTIONS: { value: PlotStatus; label: string }[] = [
    { value: PlotStatus.Unknown, label: "Unknown" },
    { value: PlotStatus.Rumored, label: "Rumored" },
    { value: PlotStatus.InProgress, label: "In Progress" },
    { value: PlotStatus.Closed, label: "Completed" },
    { value: PlotStatus.WillNotDo, label: "Will Not Do" },
];

/**
 * Urgency options for PlotForm select dropdown
 */
export const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
    { value: Urgency.Ongoing, label: "Ongoing" },
    { value: Urgency.Critical, label: "Critical" },
    { value: Urgency.Resolved, label: "Resolved" },
];
