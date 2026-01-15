import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { formatRelativeTime } from "./formatRelativeTime";

describe("formatRelativeTime", () => {
    beforeEach(() => {
        // Set a fixed date for consistent testing
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test("should return 'a few seconds' for dates less than 60 seconds ago", () => {
        const date = new Date("2024-01-15T11:59:30Z"); // 30 seconds ago
        expect(formatRelativeTime(date)).toBe("a few seconds");
    });

    test("should return '1 minute' for exactly 1 minute ago", () => {
        const date = new Date("2024-01-15T11:59:00Z"); // 1 minute ago
        expect(formatRelativeTime(date)).toBe("1 minute");
    });

    test("should return 'N minutes' for multiple minutes ago", () => {
        const date = new Date("2024-01-15T11:45:00Z"); // 15 minutes ago
        expect(formatRelativeTime(date)).toBe("15 minutes");
    });

    test("should return '1 hour' for exactly 1 hour ago", () => {
        const date = new Date("2024-01-15T11:00:00Z"); // 1 hour ago
        expect(formatRelativeTime(date)).toBe("1 hour");
    });

    test("should return 'N hours' for multiple hours ago", () => {
        const date = new Date("2024-01-15T09:00:00Z"); // 3 hours ago
        expect(formatRelativeTime(date)).toBe("3 hours");
    });

    test("should return 'yesterday' for exactly 1 day ago", () => {
        const date = new Date("2024-01-14T12:00:00Z"); // 1 day ago
        expect(formatRelativeTime(date)).toBe("yesterday");
    });

    test("should return 'N days' for multiple days ago", () => {
        const date = new Date("2024-01-12T12:00:00Z"); // 3 days ago
        expect(formatRelativeTime(date)).toBe("3 days");
    });

    test("should return '1 week' for exactly 1 week ago", () => {
        const date = new Date("2024-01-08T12:00:00Z"); // 7 days ago
        expect(formatRelativeTime(date)).toBe("1 week");
    });

    test("should return 'N weeks' for multiple weeks ago", () => {
        const date = new Date("2024-01-01T12:00:00Z"); // 14 days ago
        expect(formatRelativeTime(date)).toBe("2 weeks");
    });

    test("should return 'last month' for exactly 1 month ago", () => {
        const date = new Date("2023-12-15T12:00:00Z"); // 31 days ago
        expect(formatRelativeTime(date)).toBe("last month");
    });

    test("should return 'N months' for multiple months ago", () => {
        const date = new Date("2023-10-15T12:00:00Z"); // ~90 days ago
        expect(formatRelativeTime(date)).toBe("3 months");
    });

    test("should return '1 year' for exactly 1 year ago", () => {
        const date = new Date("2023-01-15T12:00:00Z"); // 365 days ago
        expect(formatRelativeTime(date)).toBe("1 year");
    });

    test("should return 'N years' for multiple years ago", () => {
        const date = new Date("2022-01-15T12:00:00Z"); // 730 days ago
        expect(formatRelativeTime(date)).toBe("2 years");
    });

    test("should handle ISO string input", () => {
        const dateString = "2024-01-15T11:45:00Z"; // 15 minutes ago
        expect(formatRelativeTime(dateString)).toBe("15 minutes");
    });

    test("should handle Date object input", () => {
        const date = new Date("2024-01-15T09:00:00Z"); // 3 hours ago
        expect(formatRelativeTime(date)).toBe("3 hours");
    });
});
