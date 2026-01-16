/**
 * Formats a date as a human-friendly relative time string
 * @param date - The date to format (can be Date object or ISO string)
 * @returns A human-friendly string like "2 minutes", "3 hours", "6 days", etc.
 */
export function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const targetDate = typeof date === "string" ? new Date(date) : date;

    // Calculate difference in milliseconds
    const diffMs = now.getTime() - targetDate.getTime();

    // Convert to seconds
    const diffSeconds = Math.floor(diffMs / 1000);

    // Less than a minute
    if (diffSeconds < 60) {
        return "a few seconds";
    }

    // Less than an hour
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
        return diffMinutes === 1 ? "1 minute" : `${diffMinutes} minutes`;
    }

    // Less than a day
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return diffHours === 1 ? "1 hour" : `${diffHours} hours`;
    }

    // Less than a week
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
        if (diffDays === 1) return "yesterday";
        return `${diffDays} days`;
    }

    // Less than a month (30 days)
    if (diffDays < 30) {
        const diffWeeks = Math.floor(diffDays / 7);
        return diffWeeks === 1 ? "1 week" : `${diffWeeks} weeks`;
    }

    // Less than a year
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
        if (diffMonths === 1) return "last month";
        return `${diffMonths} months`;
    }

    // More than a year
    const diffYears = Math.floor(diffDays / 365);
    return diffYears === 1 ? "1 year" : `${diffYears} years`;
}
