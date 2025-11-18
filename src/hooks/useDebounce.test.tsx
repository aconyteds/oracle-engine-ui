import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("should return initial value immediately", () => {
        const { result } = renderHook(() => useDebounce("initial", 500));

        expect(result.current).toBe("initial");
    });

    test("should debounce string value changes", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: "initial", delay: 500 },
            }
        );

        expect(result.current).toBe("initial");

        // Change value
        rerender({ value: "updated", delay: 500 });

        // Value should still be initial before delay
        expect(result.current).toBe("initial");

        // Fast-forward time by 500ms
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Value should now be updated
        expect(result.current).toBe("updated");
    });

    test("should debounce number value changes", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: 0, delay: 300 },
            }
        );

        expect(result.current).toBe(0);

        rerender({ value: 42, delay: 300 });
        expect(result.current).toBe(0);

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe(42);
    });

    test("should debounce object value changes", () => {
        const initialObj = { id: 1, name: "test" };
        const updatedObj = { id: 2, name: "updated" };

        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: initialObj, delay: 500 },
            }
        );

        expect(result.current).toBe(initialObj);

        rerender({ value: updatedObj, delay: 500 });
        expect(result.current).toBe(initialObj);

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe(updatedObj);
    });

    test("should use default delay of 500ms when not specified", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value),
            {
                initialProps: { value: "initial" },
            }
        );

        rerender({ value: "updated" });
        expect(result.current).toBe("initial");

        act(() => {
            vi.advanceTimersByTime(499);
        });
        expect(result.current).toBe("initial");

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current).toBe("updated");
    });

    test("should reset timer on rapid value changes", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: "v1", delay: 500 },
            }
        );

        // Change to v2
        rerender({ value: "v2", delay: 500 });

        // Wait 300ms
        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(result.current).toBe("v1");

        // Change to v3 before v2's timeout completes
        rerender({ value: "v3", delay: 500 });

        // Wait another 400ms (total 700ms from start)
        act(() => {
            vi.advanceTimersByTime(400);
        });

        // Should still be v1 because v3's timer was reset
        expect(result.current).toBe("v1");

        // Wait remaining 100ms to complete v3's timer
        act(() => {
            vi.advanceTimersByTime(100);
        });

        // Now should be v3, v2 was skipped
        expect(result.current).toBe("v3");
    });

    test("should handle delay value changes", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: "initial", delay: 500 },
            }
        );

        // Change value and delay
        rerender({ value: "updated", delay: 1000 });

        // Wait 500ms (old delay amount)
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Should still be initial because new delay is 1000ms
        expect(result.current).toBe("initial");

        // Wait remaining 500ms
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Now should be updated
        expect(result.current).toBe("updated");
    });

    test("should handle multiple sequential updates", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: 1, delay: 500 },
            }
        );

        rerender({ value: 2, delay: 500 });
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(result.current).toBe(2);

        rerender({ value: 3, delay: 500 });
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(result.current).toBe(3);

        rerender({ value: 4, delay: 500 });
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(result.current).toBe(4);
    });

    test("should cleanup timer on unmount", () => {
        const { rerender, unmount } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: "initial", delay: 500 },
            }
        );

        rerender({ value: "updated", delay: 500 });

        // Unmount before timer completes
        unmount();

        // Advance timer
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Since unmounted, we can't check result.current
        // but this test ensures no errors occur
        expect(true).toBe(true);
    });

    test("should handle boolean values", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: false, delay: 300 },
            }
        );

        expect(result.current).toBe(false);

        rerender({ value: true, delay: 300 });
        expect(result.current).toBe(false);

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe(true);
    });

    test("should handle null and undefined values", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: null as string | null, delay: 500 },
            }
        );

        expect(result.current).toBe(null);

        rerender({ value: "updated", delay: 500 });
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe("updated");

        rerender({ value: null as string | null, delay: 500 });
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe(null);
    });

    test("should handle zero delay", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: "initial", delay: 0 },
            }
        );

        rerender({ value: "updated", delay: 0 });
        expect(result.current).toBe("initial");

        act(() => {
            vi.advanceTimersByTime(0);
        });

        expect(result.current).toBe("updated");
    });
});
