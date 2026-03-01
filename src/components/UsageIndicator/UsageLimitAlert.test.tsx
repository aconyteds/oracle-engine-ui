import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "../../test-utils";
import { UsageLimitAlert } from "./UsageLimitAlert";

vi.mock("../../contexts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../contexts")>();
    return {
        ...actual,
        useUserContext: vi.fn(),
    };
});

vi.mock("@signals", () => ({
    useUsageState: vi.fn(),
}));

const defaultUserContext = {
    refreshUsage: vi.fn(),
    isLoggedIn: true,
    setIsLoggedIn: vi.fn(),
    handleLogin: vi.fn(),
    currentUser: {
        __typename: "User" as const,
        id: "1",
        name: "Test",
        subscriptionTier: "Free",
        lastSelectedCampaign: null,
        upgradeAvailable: true,
        subscriptionExpiresAt: null,
        subscriptionStatus: "FREE",
    },
    isActive: true,
    loading: false,
    showDebug: false,
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

const mockUsage = async (overrides: Record<string, unknown> = {}) => {
    const { useUsageState } = await import("@signals");
    vi.mocked(useUsageState).mockReturnValue({
        dailyUsage: { percentUsed: 1.0 },
        monthlyUsage: null,
        isLimitExceeded: true,
        isMonthlyLimitExceeded: false,
        lastUpdated: new Date(),
        ...overrides,
    } as ReturnType<typeof useUsageState>);
};

describe("UsageLimitAlert", () => {
    beforeEach(async () => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        await mockUser();
        await mockUsage();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    describe("daily limit alert", () => {
        test("should render danger alert with correct heading", () => {
            render(<UsageLimitAlert />);

            expect(screen.getByText("Daily Limit Reached")).toBeInTheDocument();
        });

        test("should display message about limit being reached", () => {
            render(<UsageLimitAlert />);

            expect(
                screen.getByText(/You've reached your daily usage limit/)
            ).toBeInTheDocument();
        });

        test("should mention midnight UTC reset", () => {
            render(<UsageLimitAlert />);

            expect(screen.getByText(/midnight UTC/)).toBeInTheDocument();
        });

        test("should render with alert-danger class", () => {
            render(<UsageLimitAlert />);

            const alert = screen.getByRole("alert");
            expect(alert).toHaveClass("alert-danger");
        });
    });

    describe("monthly limit alert", () => {
        beforeEach(async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 0.5 },
                monthlyUsage: { percentUsed: 1.0 },
                isMonthlyLimitExceeded: true,
            });
        });

        test("should show monthly limit heading when monthly limit exceeded", () => {
            render(<UsageLimitAlert />);

            expect(
                screen.getByText("Monthly Limit Reached")
            ).toBeInTheDocument();
        });

        test("should mention 1st of next month reset when no subscription expiry", () => {
            render(<UsageLimitAlert />);

            expect(screen.getByText(/1st of next month/)).toBeInTheDocument();
        });
    });

    describe("both limits exceeded", () => {
        beforeEach(async () => {
            await mockUsage({
                dailyUsage: { percentUsed: 1.0 },
                monthlyUsage: { percentUsed: 1.0 },
                isMonthlyLimitExceeded: true,
            });
        });

        test("should show monthly limit message when both exceeded", () => {
            render(<UsageLimitAlert />);

            expect(
                screen.getByText("Monthly Limit Reached")
            ).toBeInTheDocument();
        });
    });

    describe("countdown timer", () => {
        test("should display countdown timer with hours, minutes, seconds format", () => {
            render(<UsageLimitAlert />);

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            expect(screen.getByText(/\d+h \d+m \d+s/)).toBeInTheDocument();
        });

        test("should update countdown as time passes", () => {
            render(<UsageLimitAlert />);

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            const initialText = screen.getByText(/\d+h \d+m \d+s/).textContent;

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            const updatedText = screen.getByText(/\d+h \d+m \d+s/).textContent;

            expect(updatedText).not.toBe(initialText);
        });

        test("should clean up interval on unmount", () => {
            const clearIntervalSpy = vi.spyOn(global, "clearInterval");

            const { unmount } = render(<UsageLimitAlert />);

            unmount();

            expect(clearIntervalSpy).toHaveBeenCalled();
            clearIntervalSpy.mockRestore();
        });

        test("should start interval with 1 second delay", () => {
            const setIntervalSpy = vi.spyOn(global, "setInterval");

            render(<UsageLimitAlert />);

            expect(setIntervalSpy).toHaveBeenCalledWith(
                expect.any(Function),
                1000
            );
            setIntervalSpy.mockRestore();
        });
    });

    describe("refreshUsage callback", () => {
        test("should have refreshUsage available from context", async () => {
            const { useUserContext } = await import("../../contexts");

            render(<UsageLimitAlert />);

            expect(useUserContext).toHaveBeenCalled();
        });
    });

    describe("upgrade link", () => {
        test("should show upgrade link when monetization is enabled", () => {
            render(<UsageLimitAlert />, {
                env: { VITE_MONETIZATION_ENABLED: "true" },
            });

            const link = screen.getByRole("link", {
                name: /upgrading your subscription/,
            });
            expect(link).toHaveAttribute("href", "/subscription");
        });

        test("should hide upgrade link when monetization is disabled", () => {
            render(<UsageLimitAlert />, {
                env: { VITE_MONETIZATION_ENABLED: "false" },
            });

            expect(
                screen.queryByRole("link", {
                    name: /upgrading your subscription/,
                })
            ).not.toBeInTheDocument();
        });

        test("should show upgrade link in monthly alert when monetization is enabled", async () => {
            await mockUsage({
                monthlyUsage: { percentUsed: 1.0 },
                isMonthlyLimitExceeded: true,
            });

            render(<UsageLimitAlert />, {
                env: { VITE_MONETIZATION_ENABLED: "true" },
            });

            const link = screen.getByRole("link", {
                name: /upgrading your subscription/,
            });
            expect(link).toHaveAttribute("href", "/subscription");
        });

        test("should hide upgrade link in monthly alert when monetization is disabled", async () => {
            await mockUsage({
                monthlyUsage: { percentUsed: 1.0 },
                isMonthlyLimitExceeded: true,
            });

            render(<UsageLimitAlert />, {
                env: { VITE_MONETIZATION_ENABLED: "false" },
            });

            expect(
                screen.queryByRole("link", {
                    name: /upgrading your subscription/,
                })
            ).not.toBeInTheDocument();
        });
    });

    describe("renewal date", () => {
        test("should show renewal date when subscriptionExpiresAt is set", async () => {
            await mockUser({
                subscriptionExpiresAt: "2026-04-15T12:00:00Z",
            });
            await mockUsage({
                monthlyUsage: { percentUsed: 1.0 },
                isMonthlyLimitExceeded: true,
            });

            render(<UsageLimitAlert />);

            expect(screen.getByText(/renews on April 15/)).toBeInTheDocument();
        });

        test("should show default 1st of next month when no subscriptionExpiresAt", async () => {
            await mockUser({ subscriptionExpiresAt: null });
            await mockUsage({
                monthlyUsage: { percentUsed: 1.0 },
                isMonthlyLimitExceeded: true,
            });

            render(<UsageLimitAlert />);

            expect(screen.getByText(/1st of next month/)).toBeInTheDocument();
        });
    });
});
