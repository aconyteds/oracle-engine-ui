import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { SubscriptionStatus } from "../../graphql/generated";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { TierBadge } from "./TierBadge";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react-router-dom")>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("../../contexts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../contexts")>();
    return {
        ...actual,
        useUserContext: vi.fn(),
    };
});

vi.mock("../firebase", () => ({
    LogEvent: vi.fn(),
}));

const defaultUserContext = {
    isLoggedIn: true,
    setIsLoggedIn: vi.fn(),
    handleLogin: vi.fn(),
    isActive: true,
    loading: false,
    showDebug: false,
    refreshUsage: vi.fn(),
};

const defaultUser = {
    __typename: "User" as const,
    id: "1",
    name: "Test",
    lastSelectedCampaign: null,
    upgradeAvailable: false,
    subscriptionExpiresAt: null,
    subscriptionStatus: SubscriptionStatus.Free,
    subscriptionTier: "Free",
};

const mockWithTier = async (tier: string) => {
    const { useUserContext } = await import("../../contexts");
    vi.mocked(useUserContext).mockReturnValue({
        ...defaultUserContext,
        currentUser: { ...defaultUser, subscriptionTier: tier },
    });
};

describe("TierBadge", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    test.each([
        { tier: "Free", expectedText: "Free" },
        { tier: "Game Master", expectedText: "Game Master" },
    ])("should render $tier display name", async ({ tier, expectedText }) => {
        await mockWithTier(tier);
        render(<TierBadge />, {
            env: { VITE_MONETIZATION_ENABLED: "true" },
        });
        expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    test("should navigate to /subscription when free tier clicked", async () => {
        await mockWithTier("Free");
        render(<TierBadge />, {
            env: { VITE_MONETIZATION_ENABLED: "true" },
        });
        fireEvent.click(screen.getByText("Free"));

        expect(mockNavigate).toHaveBeenCalledWith("/subscription");
    });

    test("should navigate to /subscription when subscribed tier clicked", async () => {
        await mockWithTier("Game Master");
        render(<TierBadge />, {
            env: { VITE_MONETIZATION_ENABLED: "true" },
        });
        fireEvent.click(screen.getByText("Game Master"));

        expect(mockNavigate).toHaveBeenCalledWith("/subscription");
    });

    test.each([
        { tier: "Free", variant: "secondary" },
        { tier: "Game Master", variant: "info" },
    ])(
        "should use $variant outline variant for $tier tier",
        async ({ tier, variant }) => {
            await mockWithTier(tier);
            render(<TierBadge />, {
                env: { VITE_MONETIZATION_ENABLED: "true" },
            });

            const badge = screen.getByText(tier);
            expect(badge).toHaveClass(`border-${variant}`, `text-${variant}`);
        }
    );

    describe("when monetization is disabled", () => {
        test("should render tier name without click handler", async () => {
            await mockWithTier("Free");
            render(<TierBadge />, {
                env: { VITE_MONETIZATION_ENABLED: "false" },
            });

            fireEvent.click(screen.getByText("Free"));

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        test("should still render correct tier styling", async () => {
            await mockWithTier("Game Master");
            render(<TierBadge />, {
                env: { VITE_MONETIZATION_ENABLED: "false" },
            });

            const badge = screen.getByText("Game Master");
            expect(badge).toHaveClass("border-info", "text-info");
        });
    });
});
