import { useEffect, useState } from "react";

/**
 * Custom hook that debounces a value by delaying updates until after a specified delay period
 * has elapsed since the last change to the value.
 *
 * @template T - The type of the value to debounce
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds before updating the debounced value (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *     // This will only run 300ms after the user stops typing
 *     if (debouncedSearchTerm) {
 *         performSearch(debouncedSearchTerm);
 *     }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const timeoutId = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clear the timeout if value or delay changes (cleanup function)
        // This resets the timer on every change
        return () => {
            clearTimeout(timeoutId);
        };
    }, [value, delay]);

    return debouncedValue;
}
