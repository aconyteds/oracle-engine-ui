import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "../../test-utils";
import { SubscriptionSuccess } from "./SubscriptionSuccess";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react-router-dom")>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("@graphql", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@graphql")>();
    return {
        ...actual,
        useCurrentUserQuery: vi.fn(() => ({
            data: null,
            loading: false,
        })),
    };
});

vi.mock("../firebase", () => ({
    LogEvent: vi.fn(),
}));

describe("SubscriptionSuccess", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    test("should render success heading", () => {
        render(<SubscriptionSuccess />);

        expect(screen.getByText("Subscription Activated!")).toBeInTheDocument();
    });

    test("should render success message", () => {
        render(<SubscriptionSuccess />);

        expect(screen.getByText(/successfully activated/)).toBeInTheDocument();
    });

    test("should render Go to Dashboard button", () => {
        render(<SubscriptionSuccess />);

        expect(
            screen.getByRole("button", { name: "Go to Dashboard" })
        ).toBeInTheDocument();
    });

    test("should show redirect notice", () => {
        render(<SubscriptionSuccess />);

        expect(
            screen.getByText(/Redirecting automatically/)
        ).toBeInTheDocument();
    });

    test("should auto-redirect after 15 seconds", () => {
        render(<SubscriptionSuccess />);

        expect(mockNavigate).not.toHaveBeenCalled();

        vi.advanceTimersByTime(15000);

        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("should navigate on button click", () => {
        const { getByRole } = render(<SubscriptionSuccess />);

        getByRole("button", { name: "Go to Dashboard" }).click();

        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("should clean up timer on unmount", () => {
        const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

        const { unmount } = render(<SubscriptionSuccess />);
        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();
        clearTimeoutSpy.mockRestore();
    });
});
