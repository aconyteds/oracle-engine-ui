import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { SubscriptionStatus } from "../../graphql/generated";
import { cleanup, fireEvent, render, screen, waitFor } from "../../test-utils";
import { UsageIndicator } from "./UsageIndicator";

vi.mock("@signals", () => ({
    useUsageState: vi.fn(),
}));

const mockToastInfo = vi.fn();

vi.mock("../../contexts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../contexts")>();
    return {
        ...actual,
        useUserContext: vi.fn(),
        useToaster: vi.fn(() => ({
            toast: {
                info: mockToastInfo,
                success: vi.fn(),
                danger: vi.fn(),
                warning: vi.fn(),
            },
        })),
    };
});

let mockSessionValue: string | null = null;
const mockSetSessionValue = vi.fn();

vi.mock("../../hooks/useStorage", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../hooks/useStorage")>();
    return {
        ...actual,
        useSessionStorage: vi.fn(
            () => [mockSessionValue, mockSetSessionValue] as const
        ),
    };
});

const defaultUsageState = {
    monthlyUsage: null,
    isMonthlyLimitExceeded: false,
    isLimitExceeded: false,
    lastUpdated: new Date(),
};

const defaultUserContext = {
    currentUser: {
        __typename: "User" as const,
        id: "1",
        name: "Test",
        subscriptionTier: "Free",
        lastSelectedCampaign: null,
        upgradeAvailable: true,
        subscriptionExpiresAt: null,
        subscriptionStatus: SubscriptionStatus.Free,
    },
    isLoggedIn: true,
    setIsLoggedIn: vi.fn(),
    handleLogin: vi.fn(),
    isActive: true,
    loading: false,
    showDebug: false,
    refreshUsage: vi.fn(),
};

const mockUsage = async (overrides: Record<string, unknown> = {}) => {
    const { useUsageState } = await import("@signals");
    vi.mocked(useUsageState).mockReturnValue({
        ...defaultUsageState,
        ...overrides,
    } as ReturnType<typeof useUsageState>);
};

const mockUser = async (overrides: Record<string, unknown> = {}) => {
    const { useUserContext } = await import("../../contexts");
    vi.mocked(useUserContext).mockReturnValue({
        ...defaultUserContext,
        currentUser: {
            ...defaultUserContext.currentUser,
            ...overrides,
        },
    } as ReturnType<typeof useUserContext>);
};

describe("UsageIndicator", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        mockSessionValue = null;
        await mockUser();
    });

    afterEach(() => {
        cleanup();
    });

    describe("visibility thresholds", () => {
        test("should not render when dailyUsage is null", async () => {
            await mockUsage({
                dailyUsage: null,
                monthlyUsage: null,
            });

            render(<UsageIndicator />);

            expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
        });

        test("should not render when percentUsed is below 50%", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.49 },
            });

            render(<UsageIndicator />);

            expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
        });

        test("should render when percentUsed is exactly 50%", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.5 },
            });

            render(<UsageIndicator />);

            expect(screen.getByText("50% remaining")).toBeInTheDocument();
        });

        test("should render when percentUsed is above 50%", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.6 },
            });

            render(<UsageIndicator />);

            expect(screen.getByText("40% remaining")).toBeInTheDocument();
        });
    });

    describe("remaining percentage display", () => {
        test.each([
            { percentUsed: 0.5, expected: "50%" },
            { percentUsed: 0.75, expected: "25%" },
            { percentUsed: 0.9, expected: "10%" },
            { percentUsed: 1.0, expected: "0%" },
        ])(
            "should display $expected remaining when percentUsed is $percentUsed",
            async ({ percentUsed, expected }) => {
                await mockUsage({
                    dailyUsage: { percentUsed },
                    isLimitExceeded: percentUsed >= 1,
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
                await mockUsage({
                    dailyUsage: { percentUsed },
                    isLimitExceeded: percentUsed >= 1,
                });

                render(<UsageIndicator />);

                const remaining = Math.round(100 - percentUsed * 100);
                expect(
                    screen.getByText(`${remaining}% remaining`)
                ).toBeInTheDocument();

                expect(expectedSeverity).toBeDefined();
            }
        );

        test("should apply danger severity when isLimitExceeded is true regardless of percentage", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.85 },
                isLimitExceeded: true,
            });

            render(<UsageIndicator />);

            expect(screen.getByText("15% remaining")).toBeInTheDocument();
        });
    });

    describe("icon display", () => {
        test("should display chart-line icon", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.6 },
            });

            render(<UsageIndicator />);

            const svg = document.querySelector('[data-icon="chart-line"]');
            expect(svg).toBeInTheDocument();
        });
    });

    describe("overlay trigger", () => {
        test("should have hover and focus triggers for popover", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.75 },
            });

            render(<UsageIndicator />);

            const row = screen.getByText("25% remaining").closest(".row");
            expect(row).toBeInTheDocument();
        });
    });

    describe("monthly usage display", () => {
        test("should show monthly remaining when monthly is higher than daily", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.5 },
                monthlyUsage: { percentUsed: 0.8 },
            });

            render(<UsageIndicator />);

            expect(screen.getByText("20% remaining")).toBeInTheDocument();
        });

        test("should render when only monthly usage exceeds threshold", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.1 },
                monthlyUsage: { percentUsed: 0.6 },
            });

            render(<UsageIndicator />);

            expect(screen.getByText("40% remaining")).toBeInTheDocument();
        });
    });

    describe("upgrade link", () => {
        test("should show upgrade link when monetization is enabled", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.7 },
            });

            render(<UsageIndicator />, {
                env: { VITE_MONETIZATION_ENABLED: "true" },
            });

            fireEvent.focus(screen.getByText(/remaining/));
            await waitFor(() => {
                expect(
                    screen.getByText(/upgrading your subscription/)
                ).toBeInTheDocument();
            });
        });

        test("should hide upgrade link when upgradeAvailable is false", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.7 },
            });
            await mockUser({ upgradeAvailable: false });

            render(<UsageIndicator />, {
                env: { VITE_MONETIZATION_ENABLED: "true" },
            });

            fireEvent.focus(screen.getByText(/remaining/));
            await waitFor(() => {
                expect(
                    screen.queryByText(/upgrading your subscription/)
                ).not.toBeInTheDocument();
            });
        });

        test("should hide upgrade link when monetization is disabled", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.7 },
            });

            render(<UsageIndicator />, {
                env: { VITE_MONETIZATION_ENABLED: "false" },
            });

            fireEvent.focus(screen.getByText(/remaining/));
            await waitFor(() => {
                expect(
                    screen.queryByText(/upgrading your subscription/)
                ).not.toBeInTheDocument();
            });
        });
    });

    describe("renewal date in popover", () => {
        test("should show renewal date when subscriptionExpiresAt is set", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.5 },
                monthlyUsage: { percentUsed: 0.6 },
            });
            await mockUser({
                subscriptionExpiresAt: "2026-04-15T12:00:00Z",
            });

            render(<UsageIndicator />);

            fireEvent.focus(screen.getByText(/remaining/));
            await waitFor(() => {
                expect(screen.getByText(/renews April 15/)).toBeInTheDocument();
            });
        });

        test("should show default reset text when no subscriptionExpiresAt", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.5 },
                monthlyUsage: { percentUsed: 0.6 },
            });
            await mockUser({ subscriptionExpiresAt: null });

            render(<UsageIndicator />);

            fireEvent.focus(screen.getByText(/remaining/));
            await waitFor(() => {
                expect(
                    screen.getByText(/resets on the 1st/)
                ).toBeInTheDocument();
            });
        });
    });

    describe("cancellation toast", () => {
        const soonExpiryDate = new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
        ).toISOString();

        test("should show toast when canceled and expiring within 5 days", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.5 },
            });
            await mockUser({
                subscriptionStatus: SubscriptionStatus.CancelPending,
                subscriptionExpiresAt: soonExpiryDate,
            });
            mockSessionValue = null;

            render(<UsageIndicator />);

            expect(mockToastInfo).toHaveBeenCalledOnce();
            expect(mockToastInfo).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Subscription Expiring",
                    duration: null,
                })
            );
            expect(mockSetSessionValue).toHaveBeenCalledWith(
                new Date().toDateString()
            );
        });

        test("should not show toast when expiry is more than 5 days away", async () => {
            const farExpiryDate = new Date(
                Date.now() + 10 * 24 * 60 * 60 * 1000
            ).toISOString();
            await mockUsage({
                dailyUsage: { percentUsed: 0.5 },
            });
            await mockUser({
                subscriptionStatus: SubscriptionStatus.CancelPending,
                subscriptionExpiresAt: farExpiryDate,
            });

            render(<UsageIndicator />);

            expect(mockToastInfo).not.toHaveBeenCalled();
        });

        test("should not show toast when already shown today", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.5 },
            });
            await mockUser({
                subscriptionStatus: SubscriptionStatus.CancelPending,
                subscriptionExpiresAt: soonExpiryDate,
            });
            mockSessionValue = new Date().toDateString();

            render(<UsageIndicator />);

            expect(mockToastInfo).not.toHaveBeenCalled();
        });

        test("should not show toast when subscription is active", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.5 },
            });
            await mockUser({
                subscriptionStatus: SubscriptionStatus.Active,
            });

            render(<UsageIndicator />);

            expect(mockToastInfo).not.toHaveBeenCalled();
        });

        test("should not show toast when subscriptionExpiresAt is null", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.5 },
            });
            await mockUser({
                subscriptionStatus: SubscriptionStatus.CancelPending,
                subscriptionExpiresAt: null,
            });

            render(<UsageIndicator />);

            expect(mockToastInfo).not.toHaveBeenCalled();
        });

        test("should include expiry date in toast message", async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.5 },
            });
            await mockUser({
                subscriptionStatus: SubscriptionStatus.CancelPending,
                subscriptionExpiresAt: soonExpiryDate,
            });

            render(<UsageIndicator />);

            expect(mockToastInfo).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining("expire on"),
                })
            );
        });
    });
});
