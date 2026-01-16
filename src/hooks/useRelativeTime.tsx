import { useEffect, useRef, useState } from "react";
import { formatRelativeTime } from "../utils";

/**
 * Custom hook that returns a relative time string that auto-updates every 60 seconds
 * @param date - The date to format (can be Date object or ISO string)
 * @returns A human-friendly string like "2 minutes", "3 hours", etc. that updates automatically
 */
export function useRelativeTime(date: Date | string): string {
    const [formattedTime, setFormattedTime] = useState(() =>
        formatRelativeTime(date)
    );
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Update formatted time immediately if date changes
        setFormattedTime(formatRelativeTime(date));

        // Set up interval to update every 60 seconds
        intervalRef.current = setInterval(() => {
            const newFormattedTime = formatRelativeTime(date);
            // Only update state if the formatted string actually changed
            setFormattedTime((prevTime) => {
                if (prevTime !== newFormattedTime) {
                    return newFormattedTime;
                }
                return prevTime;
            });
        }, 60000); // 60 seconds

        // Cleanup interval on unmount or when date changes
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [date]);

    return formattedTime;
}
