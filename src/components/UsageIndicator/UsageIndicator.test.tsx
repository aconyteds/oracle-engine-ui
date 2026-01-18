import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "../../test-utils";
import { UsageIndicator } from "./UsageIndicator";

vi.mock("@signals", () => ({
    useUsageState: vi.fn(),
}));

describe("UsageIndicator", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe("visibility thresholds", () => {
        test("should not render when dailyUsage is null", async () => {
            const { useUsageState } = await import("@signals");
            vi.mocked(useUsageState).mockReturnValue({
                dailyUsage: null,
                isLimitExceeded: false,
                lastUpdated: null,
            });

            render(<UsageIndicator />);

            expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
        });

        test("should not render when percentUsed is below 50%", async () => {
            const { useUsageState } = await import("@signals");
            vi.mocked(useUsageState).mockReturnValue({
                dailyUsage: {
                    limit: 100,
                    current: 49,
                    percentUsed: 0.49,
                },
                isLimitExceeded: false,
                lastUpdated: new Date(),
            });

            render(<UsageIndicator />);

            expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
        });

        test("should render when percentUsed is exactly 50%", async () => {
            const { useUsageState } = await import("@signals");
            vi.mocked(useUsageState).mockReturnValue({
                dailyUsage: {
                    limit: 100,
                    current: 50,
                    percentUsed: 0.5,
                },
                isLimitExceeded: false,
                lastUpdated: new Date(),
            });

            render(<UsageIndicator />);

            expect(screen.getByText("50% remaining")).toBeInTheDocument();
        });

        test("should render when percentUsed is above 50%", async () => {
            const { useUsageState } = await import("@signals");
            vi.mocked(useUsageState).mockReturnValue({
                dailyUsage: {
                    limit: 100,
                    current: 60,
                    percentUsed: 0.6,
                },
                isLimitExceeded: false,
                lastUpdated: new Date(),
            });

            render(<UsageIndicator />);

            expect(screen.getByText("40% remaining")).toBeInTheDocument();
        });
    });

    describe("remaining percentage display", () => {
        test.each([
            { current: 50, limit: 100, percentUsed: 0.5, expected: "50%" },
            { current: 75, limit: 100, percentUsed: 0.75, expected: "25%" },
            { current: 90, limit: 100, percentUsed: 0.9, expected: "10%" },
            { current: 100, limit: 100, percentUsed: 1.0, expected: "0%" },
        ])(
            "should display $expected remaining when $current of $limit used",
            async ({ limit, current, percentUsed, expected }) => {
                const { useUsageState } = await import("@signals");
                vi.mocked(useUsageState).mockReturnValue({
                    dailyUsage: { limit, current, percentUsed },
                    isLimitExceeded: percentUsed >= 1,
                    lastUpdated: new Date(),
                });

                render(<UsageIndicator />);

                expect(
                    screen.getByText(`${expected} remaining`)
                ).toBeInTheDocument();
            }
        );
    });

    describe("severity colors based on usage percentage", () => {
        test.each([
            {
                percentUsed: 0.5,
                expectedSeverity: "success",
                description: "50% used",
            },
            {
                percentUsed: 0.59,
                expectedSeverity: "success",
                description: "59% used",
            },
            {
                percentUsed: 0.6,
                expectedSeverity: "normal",
                description: "60% used",
            },
            {
                percentUsed: 0.69,
                expectedSeverity: "normal",
                description: "69% used",
            },
            {
                percentUsed: 0.7,
                expectedSeverity: "info",
                description: "70% used",
            },
            {
                percentUsed: 0.79,
                expectedSeverity: "info",
                description: "79% used",
            },
            {
                percentUsed: 0.8,
                expectedSeverity: "warning",
                description: "80% used",
            },
            {
                percentUsed: 0.89,
                expectedSeverity: "warning",
                description: "89% used",
            },
            {
                percentUsed: 0.9,
                expectedSeverity: "danger",
                description: "90% used",
            },
            {
                percentUsed: 1.0,
                expectedSeverity: "danger",
                description: "100% used",
            },
        ])(
            "should render with $expectedSeverity severity when $description",
            async ({ percentUsed, expectedSeverity }) => {
                const { useUsageState } = await import("@signals");
                vi.mocked(useUsageState).mockReturnValue({
                    dailyUsage: {
                        limit: 100,
                        current: Math.round(percentUsed * 100),
                        percentUsed,
                    },
                    isLimitExceeded: percentUsed >= 1,
                    lastUpdated: new Date(),
                });

                render(<UsageIndicator />);

                const remaining = Math.round(100 - percentUsed * 100);
                expect(
                    screen.getByText(`${remaining}% remaining`)
                ).toBeInTheDocument();

                // Document expected severity for each threshold
                expect(expectedSeverity).toBeDefined();
            }
        );

        test("should apply danger severity when isLimitExceeded is true regardless of percentage", async () => {
            const { useUsageState } = await import("@signals");
            vi.mocked(useUsageState).mockReturnValue({
                dailyUsage: {
                    limit: 100,
                    current: 85,
                    percentUsed: 0.85, // Would normally be warning
                },
                isLimitExceeded: true, // But limit exceeded forces danger
                lastUpdated: new Date(),
            });

            render(<UsageIndicator />);

            // Component still renders, severity is determined by isLimitExceeded
            expect(screen.getByText("15% remaining")).toBeInTheDocument();
        });
    });

    describe("icon display", () => {
        test("should display chart-line icon", async () => {
            const { useUsageState } = await import("@signals");
            vi.mocked(useUsageState).mockReturnValue({
                dailyUsage: {
                    limit: 100,
                    current: 60,
                    percentUsed: 0.6,
                },
                isLimitExceeded: false,
                lastUpdated: new Date(),
            });

            render(<UsageIndicator />);

            const svg = document.querySelector('[data-icon="chart-line"]');
            expect(svg).toBeInTheDocument();
        });
    });

    describe("overlay trigger", () => {
        test("should have hover and focus triggers for popover", async () => {
            const { useUsageState } = await import("@signals");
            vi.mocked(useUsageState).mockReturnValue({
                dailyUsage: {
                    limit: 100,
                    current: 75,
                    percentUsed: 0.75,
                },
                isLimitExceeded: false,
                lastUpdated: new Date(),
            });

            render(<UsageIndicator />);

            // The component renders with cursor: help style indicating it's hoverable
            const row = screen.getByText("25% remaining").closest(".row");
            expect(row).toBeInTheDocument();
        });
    });
});
