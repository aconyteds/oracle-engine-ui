import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "../../test-utils";
import { DailyLimitAlert } from "./DailyLimitAlert";

vi.mock("../../contexts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../contexts")>();
    return {
        ...actual,
        useUserContext: vi.fn(),
    };
});

describe("DailyLimitAlert", () => {
    let mockRefreshUsage: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        vi.useFakeTimers();
        mockRefreshUsage = vi.fn();

        const { useUserContext } = await import("../../contexts");
        vi.mocked(useUserContext).mockReturnValue({
            refreshUsage: mockRefreshUsage,
            isLoggedIn: true,
            setIsLoggedIn: vi.fn(),
            handleLogin: vi.fn(),
            currentUser: null,
            isActive: true,
            loading: false,
            showDebug: false,
        });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    describe("alert display", () => {
        test("should render danger alert with correct heading", () => {
            render(<DailyLimitAlert />);

            expect(screen.getByText("Daily Limit Reached")).toBeInTheDocument();
        });

        test("should display message about limit being reached", () => {
            render(<DailyLimitAlert />);

            expect(
                screen.getByText(/You've reached your daily usage limit/)
            ).toBeInTheDocument();
        });

        test("should mention midnight UTC reset", () => {
            render(<DailyLimitAlert />);

            expect(screen.getByText(/midnight UTC/)).toBeInTheDocument();
        });

        test("should suggest upgrading subscription", () => {
            render(<DailyLimitAlert />);

            expect(
                screen.getByText(/consider upgrading your subscription/)
            ).toBeInTheDocument();
        });

        test("should render with alert-danger class", () => {
            render(<DailyLimitAlert />);

            const alert = screen.getByRole("alert");
            expect(alert).toHaveClass("alert-danger");
        });
    });

    describe("countdown timer", () => {
        test("should display countdown timer with hours, minutes, seconds format", () => {
            render(<DailyLimitAlert />);

            // Advance timers to trigger initial interval
            act(() => {
                vi.advanceTimersByTime(1000);
            });

            // Should show time in h m s format
            expect(screen.getByText(/\d+h \d+m \d+s/)).toBeInTheDocument();
        });

        test("should update countdown as time passes", () => {
            render(<DailyLimitAlert />);

            // Get initial time
            act(() => {
                vi.advanceTimersByTime(1000);
            });

            const initialText = screen.getByText(/\d+h \d+m \d+s/).textContent;

            // Advance another second
            act(() => {
                vi.advanceTimersByTime(1000);
            });

            const updatedText = screen.getByText(/\d+h \d+m \d+s/).textContent;

            // The time should have changed (decremented)
            expect(updatedText).not.toBe(initialText);
        });

        test("should clean up interval on unmount", () => {
            const clearIntervalSpy = vi.spyOn(global, "clearInterval");

            const { unmount } = render(<DailyLimitAlert />);

            unmount();

            expect(clearIntervalSpy).toHaveBeenCalled();
            clearIntervalSpy.mockRestore();
        });

        test("should start interval with 1 second delay", () => {
            const setIntervalSpy = vi.spyOn(global, "setInterval");

            render(<DailyLimitAlert />);

            expect(setIntervalSpy).toHaveBeenCalledWith(
                expect.any(Function),
                1000
            );
            setIntervalSpy.mockRestore();
        });
    });

    describe("time display format", () => {
        test("should display hours component", () => {
            render(<DailyLimitAlert />);

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            // Format should include hours with 'h' suffix
            expect(screen.getByText(/\d+h/)).toBeInTheDocument();
        });

        test("should display minutes component", () => {
            render(<DailyLimitAlert />);

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            // Format should include minutes with 'm' suffix
            expect(screen.getByText(/\d+m/)).toBeInTheDocument();
        });

        test("should display seconds component", () => {
            render(<DailyLimitAlert />);

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            // Format should include seconds with 's' suffix
            expect(screen.getByText(/\d+s/)).toBeInTheDocument();
        });
    });

    describe("refreshUsage callback", () => {
        test("should have refreshUsage available from context", async () => {
            const { useUserContext } = await import("../../contexts");

            render(<DailyLimitAlert />);

            expect(useUserContext).toHaveBeenCalled();
        });

        test("should use refreshUsage from context", async () => {
            const { useUserContext } = await import("../../contexts");

            render(<DailyLimitAlert />);

            const contextResult = vi.mocked(useUserContext).mock.results[0];
            expect(contextResult?.value.refreshUsage).toBe(mockRefreshUsage);
        });
    });
});
