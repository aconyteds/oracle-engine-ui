import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
    type DailyUsage,
    usageManager,
    usageStateSignal,
    useUsageState,
} from "./usageState";

describe("usageState", () => {
    beforeEach(() => {
        // Reset signal state before each test
        usageManager.reset();
    });

    afterEach(() => {
        // Clean up after each test
        usageManager.reset();
        vi.restoreAllMocks();
    });

    describe("usageManager.updateUsage", () => {
        test("should update usage with provided daily usage data", () => {
            const dailyUsage: DailyUsage = {
                percentUsed: 0.5,
            };

            usageManager.updateUsage(dailyUsage);

            expect(usageStateSignal.value.dailyUsage).toEqual(dailyUsage);
            expect(usageStateSignal.value.isLimitExceeded).toBe(false);
            expect(usageStateSignal.value.lastUpdated).toBeInstanceOf(Date);
        });

        test("should set isLimitExceeded to true when percentUsed is 100% (1.0)", () => {
            const dailyUsage: DailyUsage = {
                percentUsed: 1.0,
            };

            usageManager.updateUsage(dailyUsage);

            expect(usageStateSignal.value.isLimitExceeded).toBe(true);
        });

        test("should set isLimitExceeded to true when percentUsed exceeds 100%", () => {
            const dailyUsage: DailyUsage = {
                percentUsed: 1.2,
            };

            usageManager.updateUsage(dailyUsage);

            expect(usageStateSignal.value.isLimitExceeded).toBe(true);
        });

        test("should set isLimitExceeded to false when percentUsed is below 100%", () => {
            const dailyUsage: DailyUsage = {
                percentUsed: 0.99,
            };

            usageManager.updateUsage(dailyUsage);

            expect(usageStateSignal.value.isLimitExceeded).toBe(false);
        });

        test("should update lastUpdated timestamp on each call", () => {
            const dailyUsage: DailyUsage = {
                percentUsed: 0.5,
            };

            // Use fake timers to ensure different timestamps
            vi.useFakeTimers();

            usageManager.updateUsage(dailyUsage);
            const firstUpdate = usageStateSignal.value.lastUpdated;

            vi.advanceTimersByTime(100);

            usageManager.updateUsage(dailyUsage);
            const secondUpdate = usageStateSignal.value.lastUpdated;

            vi.useRealTimers();

            expect(firstUpdate).toBeInstanceOf(Date);
            expect(secondUpdate).toBeInstanceOf(Date);
            expect(firstUpdate).not.toBe(secondUpdate);
            expect(secondUpdate!.getTime()).toBeGreaterThan(
                firstUpdate!.getTime()
            );
        });

        test("should handle edge case of exactly 0% usage", () => {
            const dailyUsage: DailyUsage = {
                percentUsed: 0,
            };

            usageManager.updateUsage(dailyUsage);

            expect(usageStateSignal.value.dailyUsage).toEqual(dailyUsage);
            expect(usageStateSignal.value.isLimitExceeded).toBe(false);
        });
    });

    describe("usageManager.setLimitExceeded", () => {
        test("should set isLimitExceeded to true", () => {
            usageManager.setLimitExceeded(true);

            expect(usageStateSignal.value.isLimitExceeded).toBe(true);
        });

        test("should set isLimitExceeded to false", () => {
            // First set it to true
            usageManager.setLimitExceeded(true);
            expect(usageStateSignal.value.isLimitExceeded).toBe(true);

            // Then set it to false
            usageManager.setLimitExceeded(false);
            expect(usageStateSignal.value.isLimitExceeded).toBe(false);
        });

        test("should preserve existing dailyUsage and lastUpdated values", () => {
            const dailyUsage: DailyUsage = {
                percentUsed: 0.5,
            };

            usageManager.updateUsage(dailyUsage);
            const initialLastUpdated = usageStateSignal.value.lastUpdated;

            usageManager.setLimitExceeded(true);

            expect(usageStateSignal.value.dailyUsage).toEqual(dailyUsage);
            expect(usageStateSignal.value.lastUpdated).toBe(initialLastUpdated);
            expect(usageStateSignal.value.isLimitExceeded).toBe(true);
        });

        test("should work when no previous usage data exists", () => {
            usageManager.setLimitExceeded(true);

            expect(usageStateSignal.value.dailyUsage).toBeNull();
            expect(usageStateSignal.value.lastUpdated).toBeNull();
            expect(usageStateSignal.value.isLimitExceeded).toBe(true);
        });
    });

    describe("usageManager.reset", () => {
        test("should reset all state to initial values", () => {
            const dailyUsage: DailyUsage = {
                percentUsed: 0.5,
            };

            usageManager.updateUsage(dailyUsage);
            usageManager.setLimitExceeded(true);

            // Verify state is not initial
            expect(usageStateSignal.value.dailyUsage).not.toBeNull();
            expect(usageStateSignal.value.lastUpdated).not.toBeNull();
            expect(usageStateSignal.value.isLimitExceeded).toBe(true);

            // Reset
            usageManager.reset();

            expect(usageStateSignal.value.dailyUsage).toBeNull();
            expect(usageStateSignal.value.isLimitExceeded).toBe(false);
            expect(usageStateSignal.value.lastUpdated).toBeNull();
        });

        test("should be idempotent when called multiple times", () => {
            const dailyUsage: DailyUsage = {
                percentUsed: 0.5,
            };

            usageManager.updateUsage(dailyUsage);
            usageManager.reset();
            usageManager.reset();

            expect(usageStateSignal.value.dailyUsage).toBeNull();
            expect(usageStateSignal.value.isLimitExceeded).toBe(false);
            expect(usageStateSignal.value.lastUpdated).toBeNull();
        });

        test("should work when state is already at initial values", () => {
            usageManager.reset();

            expect(usageStateSignal.value.dailyUsage).toBeNull();
            expect(usageStateSignal.value.isLimitExceeded).toBe(false);
            expect(usageStateSignal.value.lastUpdated).toBeNull();
        });
    });

    describe("useUsageState hook", () => {
        test("should return current usage state", () => {
            const dailyUsage: DailyUsage = {
                percentUsed: 0.5,
            };

            usageManager.updateUsage(dailyUsage);

            const { result } = renderHook(() => useUsageState());

            expect(result.current.dailyUsage).toEqual(dailyUsage);
            expect(result.current.isLimitExceeded).toBe(false);
            expect(result.current.lastUpdated).toBeInstanceOf(Date);
        });

        test("should return initial state when no usage has been set", () => {
            const { result } = renderHook(() => useUsageState());

            expect(result.current.dailyUsage).toBeNull();
            expect(result.current.isLimitExceeded).toBe(false);
            expect(result.current.lastUpdated).toBeNull();
        });

        test("should reflect updates made to usage state", () => {
            usageManager.setLimitExceeded(true);

            const { result } = renderHook(() => useUsageState());

            expect(result.current.isLimitExceeded).toBe(true);
        });

        test("should reflect reset state", () => {
            const dailyUsage: DailyUsage = {
                percentUsed: 0.5,
            };

            usageManager.updateUsage(dailyUsage);
            usageManager.reset();

            const { result } = renderHook(() => useUsageState());

            expect(result.current.dailyUsage).toBeNull();
            expect(result.current.isLimitExceeded).toBe(false);
            expect(result.current.lastUpdated).toBeNull();
        });
    });

    describe("integration scenarios", () => {
        test("should handle typical usage flow: update -> update -> reset", () => {
            // Initial update
            const usage1: DailyUsage = {
                percentUsed: 0.25,
            };
            usageManager.updateUsage(usage1);

            expect(usageStateSignal.value.dailyUsage?.percentUsed).toBe(0.25);
            expect(usageStateSignal.value.isLimitExceeded).toBe(false);

            // Second update with higher usage
            const usage2: DailyUsage = {
                percentUsed: 0.75,
            };
            usageManager.updateUsage(usage2);

            expect(usageStateSignal.value.dailyUsage?.percentUsed).toBe(0.75);
            expect(usageStateSignal.value.isLimitExceeded).toBe(false);

            // Reset
            usageManager.reset();

            expect(usageStateSignal.value.dailyUsage).toBeNull();
            expect(usageStateSignal.value.isLimitExceeded).toBe(false);
        });

        test("should handle manual limit override after automatic calculation", () => {
            // Update with usage below limit
            const usage: DailyUsage = {
                percentUsed: 0.5,
            };
            usageManager.updateUsage(usage);

            expect(usageStateSignal.value.isLimitExceeded).toBe(false);

            // Manually override limit exceeded flag (e.g., for testing or special conditions)
            usageManager.setLimitExceeded(true);

            expect(usageStateSignal.value.isLimitExceeded).toBe(true);
            expect(usageStateSignal.value.dailyUsage).toEqual(usage);
        });

        test("should handle reaching and then resetting limit", () => {
            // Reach limit
            const usageAtLimit: DailyUsage = {
                percentUsed: 1.0,
            };
            usageManager.updateUsage(usageAtLimit);

            expect(usageStateSignal.value.isLimitExceeded).toBe(true);

            // Reset (e.g., new day starts)
            usageManager.reset();

            expect(usageStateSignal.value.isLimitExceeded).toBe(false);
            expect(usageStateSignal.value.dailyUsage).toBeNull();
        });
    });
});
