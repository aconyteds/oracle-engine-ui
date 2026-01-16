import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useRelativeTime } from "./useRelativeTime";

describe("useRelativeTime", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test("should return initial formatted time", () => {
        const date = new Date("2024-01-15T11:45:00Z"); // 15 minutes ago
        const { result } = renderHook(() => useRelativeTime(date));

        expect(result.current).toBe("15 minutes");
    });

    test("should handle ISO string input", () => {
        const dateString = "2024-01-15T11:30:00Z"; // 30 minutes ago
        const { result } = renderHook(() => useRelativeTime(dateString));

        expect(result.current).toBe("30 minutes");
    });

    test("should update after 60 seconds when formatted value changes", async () => {
        // Start at 11:59:30 (30 seconds ago)
        const date = new Date("2024-01-15T11:59:30Z");
        const { result } = renderHook(() => useRelativeTime(date));

        // Initially should show "a few seconds"
        expect(result.current).toBe("a few seconds");

        // Advance time by 60 seconds (now 90 seconds have passed)
        await act(async () => {
            vi.advanceTimersByTime(60000);
        });

        // Should now show "1 minute"
        expect(result.current).toBe("1 minute");
    });

    test("should not trigger re-render if formatted value hasn't changed", async () => {
        // Start at 11:58:00 (2 minutes ago)
        const date = new Date("2024-01-15T11:58:00Z");
        const { result } = renderHook(() => useRelativeTime(date));

        // Initially should show "2 minutes"
        expect(result.current).toBe("2 minutes");

        // Advance time by 30 seconds (now 2.5 minutes have passed)
        // Still rounds to "2 minutes", so no update expected
        vi.advanceTimersByTime(30000);

        // Should still show "2 minutes" (no change)
        expect(result.current).toBe("2 minutes");
    });

    test("should clean up interval on unmount", () => {
        const date = new Date("2024-01-15T11:45:00Z");
        const { unmount } = renderHook(() => useRelativeTime(date));

        // Spy on clearInterval
        const clearIntervalSpy = vi.spyOn(global, "clearInterval");

        unmount();

        // Verify clearInterval was called
        expect(clearIntervalSpy).toHaveBeenCalled();

        clearIntervalSpy.mockRestore();
    });

    test("should update immediately when date prop changes", () => {
        const date1 = new Date("2024-01-15T11:45:00Z"); // 15 minutes ago
        const { result, rerender } = renderHook(
            ({ date }) => useRelativeTime(date),
            {
                initialProps: { date: date1 },
            }
        );

        expect(result.current).toBe("15 minutes");

        // Change to a different date (30 minutes ago)
        const date2 = new Date("2024-01-15T11:30:00Z");
        rerender({ date: date2 });

        // Should immediately reflect new date
        expect(result.current).toBe("30 minutes");
    });

    test("should restart interval when date changes", () => {
        const date1 = new Date("2024-01-15T11:45:00Z");
        const { rerender } = renderHook(({ date }) => useRelativeTime(date), {
            initialProps: { date: date1 },
        });

        // Spy on setInterval
        const setIntervalSpy = vi.spyOn(global, "setInterval");
        const initialCallCount = setIntervalSpy.mock.calls.length;

        // Change date
        const date2 = new Date("2024-01-15T11:30:00Z");
        rerender({ date: date2 });

        // Verify setInterval was called again
        expect(setIntervalSpy.mock.calls.length).toBeGreaterThan(
            initialCallCount
        );

        setIntervalSpy.mockRestore();
    });

    test("should use 60 second interval", () => {
        const date = new Date("2024-01-15T11:45:00Z");
        const setIntervalSpy = vi.spyOn(global, "setInterval");

        renderHook(() => useRelativeTime(date));

        // Check that setInterval was called with 60000ms
        expect(setIntervalSpy).toHaveBeenCalledWith(
            expect.any(Function),
            60000
        );

        setIntervalSpy.mockRestore();
    });

    test("should handle transitions across time boundaries", async () => {
        // Start at 11:59:00 (1 minute ago)
        const date = new Date("2024-01-15T11:59:00Z");
        const { result } = renderHook(() => useRelativeTime(date));

        expect(result.current).toBe("1 minute");

        // Advance 60 seconds (now 2 minutes ago)
        await act(async () => {
            vi.advanceTimersByTime(60000);
        });

        expect(result.current).toBe("2 minutes");

        // Advance another 58 minutes (now 60 minutes = 1 hour ago)
        await act(async () => {
            vi.advanceTimersByTime(58 * 60000);
        });

        expect(result.current).toBe("1 hour");
    });

    test("should work with dates far in the past", () => {
        const date = new Date("2023-01-15T12:00:00Z"); // 1 year ago
        const { result } = renderHook(() => useRelativeTime(date));

        expect(result.current).toBe("1 year");
    });

    test("should work with very recent dates", () => {
        const date = new Date("2024-01-15T11:59:45Z"); // 15 seconds ago
        const { result } = renderHook(() => useRelativeTime(date));

        expect(result.current).toBe("a few seconds");
    });
});
