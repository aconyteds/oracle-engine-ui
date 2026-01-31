import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useCampaignContext } from "../../contexts";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { CampaignRequirement } from "./CampaignRequirement";

// Mock the Campaign context
vi.mock("../../contexts/Campaign.context", () => ({
    useCampaignContext: vi.fn(),
    CampaignProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock GraphQL hooks used by CampaignForm
vi.mock("@graphql", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@graphql")>();
    return {
        ...actual,
        useCreateCampaignMutation: vi.fn(() => [vi.fn(), { loading: false }]),
        useUpdateCampaignMutation: vi.fn(() => [vi.fn(), { loading: false }]),
        useDeleteCampaignMutation: vi.fn(() => [vi.fn(), { loading: false }]),
        useValidateCampaignNameQuery: vi.fn(() => ({
            data: { checkCampaignNameExists: { exists: false } },
            loading: false,
        })),
    };
});

// Mock useCampaignLimit hook
vi.mock("@hooks", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@hooks")>();
    return {
        ...actual,
        useCampaignLimit: vi.fn(() => ({
            canCreate: true,
            campaignLimit: 5,
            limitMessage: "You can create up to 5 campaigns.",
        })),
    };
});

// Mock campaign data
const mockCampaigns = [
    {
        id: "campaign-1",
        name: "Dragon Slayers",
        setting: "High Fantasy",
        tone: "Epic",
        ruleset: "D&D 5e",
    },
    {
        id: "campaign-2",
        name: "Shadowrun Team",
        setting: "Cyberpunk",
        tone: "Noir",
        ruleset: "Shadowrun",
    },
];

const mockSelectedCampaign = mockCampaigns[0];

// Default context value
const createMockContextValue = (overrides = {}) => ({
    selectedCampaign: null,
    loading: false,
    campaignList: [],
    refreshCampaigns: vi.fn().mockResolvedValue([]),
    selectCampaign: vi.fn(),
    openCampaignModal: vi.fn(),
    closeCampaignModal: vi.fn(),
    modalCampaign: null,
    isModalOpen: false,
    ...overrides,
});

describe("CampaignRequirement Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCampaignContext).mockReturnValue(createMockContextValue());
    });

    afterEach(() => {
        cleanup();
    });

    describe("Loading State", () => {
        test("should show loading spinner when loading", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({ loading: true })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            expect(screen.getByRole("status")).toBeInTheDocument();
            expect(screen.getByText("Loading...")).toBeInTheDocument();
            expect(
                screen.getByText("Loading campaigns...")
            ).toBeInTheDocument();
        });

        test("should not show children when loading", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({ loading: true })
            );

            render(
                <CampaignRequirement>
                    <div data-testid="child-content">Child Content</div>
                </CampaignRequirement>
            );

            expect(
                screen.queryByTestId("child-content")
            ).not.toBeInTheDocument();
        });
    });

    describe("No Campaign Selected - New User (No Existing Campaigns)", () => {
        test("should show 'Create Your First Campaign' heading", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: null,
                    campaignList: [],
                })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            expect(
                screen.getByText("Create Your First Campaign")
            ).toBeInTheDocument();
        });

        test("should show campaign creation form", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: null,
                    campaignList: [],
                })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            expect(
                screen.getByPlaceholderText("Enter campaign name")
            ).toBeInTheDocument();
            expect(screen.getByText("Create Campaign")).toBeInTheDocument();
        });

        test("should not show existing campaign selection", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: null,
                    campaignList: [],
                })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            expect(
                screen.queryByText("Select Existing Campaign")
            ).not.toBeInTheDocument();
        });
    });

    describe("No Campaign Selected - Has Existing Campaigns", () => {
        test("should show 'Campaign Required' heading", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: null,
                    campaignList: mockCampaigns,
                })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            expect(screen.getByText("Campaign Required")).toBeInTheDocument();
        });

        test("should show instruction message", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: null,
                    campaignList: mockCampaigns,
                })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            expect(
                screen.getByText(
                    /You need to select or create a campaign to continue/i
                )
            ).toBeInTheDocument();
        });

        test("should show existing campaign buttons", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: null,
                    campaignList: mockCampaigns,
                })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            expect(
                screen.getByText("Select Existing Campaign")
            ).toBeInTheDocument();
            expect(screen.getByText("Dragon Slayers")).toBeInTheDocument();
            expect(screen.getByText("Shadowrun Team")).toBeInTheDocument();
        });

        test("should show ruleset for campaigns that have one", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: null,
                    campaignList: mockCampaigns,
                })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            // Find the campaign buttons and verify they contain the ruleset text
            const dragonSlayersButton = screen
                .getByText("Dragon Slayers")
                .closest("button");
            expect(dragonSlayersButton).toHaveTextContent("D&D 5e");

            const shadowrunButton = screen
                .getByText("Shadowrun Team")
                .closest("button");
            expect(shadowrunButton).toHaveTextContent("Shadowrun");
        });

        test("should show 'Or Create New Campaign' section", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: null,
                    campaignList: mockCampaigns,
                })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            expect(
                screen.getByText("Or Create New Campaign")
            ).toBeInTheDocument();
        });

        test("should call selectCampaign when existing campaign is clicked", () => {
            const mockSelectCampaign = vi.fn();
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: null,
                    campaignList: mockCampaigns,
                    selectCampaign: mockSelectCampaign,
                })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            fireEvent.click(screen.getByText("Dragon Slayers"));

            expect(mockSelectCampaign).toHaveBeenCalledWith("campaign-1");
        });
    });

    describe("Campaign Selected - Renders Children", () => {
        test("should render children when campaign is selected", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: mockSelectedCampaign,
                    campaignList: mockCampaigns,
                })
            );

            render(
                <CampaignRequirement>
                    <div data-testid="child-content">Child Content</div>
                </CampaignRequirement>
            );

            expect(screen.getByTestId("child-content")).toBeInTheDocument();
            expect(screen.getByText("Child Content")).toBeInTheDocument();
        });

        test("should not show campaign creation form when campaign is selected", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: mockSelectedCampaign,
                    campaignList: mockCampaigns,
                })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            expect(
                screen.queryByPlaceholderText("Enter campaign name")
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText("Create Your First Campaign")
            ).not.toBeInTheDocument();
        });

        test("should not show loading spinner when campaign is selected", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: mockSelectedCampaign,
                    campaignList: mockCampaigns,
                })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            expect(screen.queryByRole("status")).not.toBeInTheDocument();
        });
    });

    describe("Campaign with no ruleset", () => {
        test("should not show ruleset text when campaign has no ruleset", () => {
            const campaignsWithoutRuleset = [
                {
                    id: "campaign-no-ruleset",
                    name: "No Ruleset Campaign",
                    setting: "Custom",
                    tone: "Mixed",
                    ruleset: null,
                },
            ];

            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: null,
                    campaignList: campaignsWithoutRuleset,
                })
            );

            render(
                <CampaignRequirement>
                    <div>Child Content</div>
                </CampaignRequirement>
            );

            expect(screen.getByText("No Ruleset Campaign")).toBeInTheDocument();
            // The ruleset small element should not be present
            const campaignButton = screen
                .getByText("No Ruleset Campaign")
                .closest("button");
            expect(campaignButton?.querySelector("small")).toBeNull();
        });
    });

    describe("Nested children", () => {
        test("should render complex nested children correctly", () => {
            vi.mocked(useCampaignContext).mockReturnValue(
                createMockContextValue({
                    selectedCampaign: mockSelectedCampaign,
                    campaignList: mockCampaigns,
                })
            );

            render(
                <CampaignRequirement>
                    <div data-testid="parent">
                        <header data-testid="header">Header</header>
                        <main data-testid="main">
                            <p>Main content</p>
                        </main>
                        <footer data-testid="footer">Footer</footer>
                    </div>
                </CampaignRequirement>
            );

            expect(screen.getByTestId("parent")).toBeInTheDocument();
            expect(screen.getByTestId("header")).toBeInTheDocument();
            expect(screen.getByTestId("main")).toBeInTheDocument();
            expect(screen.getByTestId("footer")).toBeInTheDocument();
        });
    });
});
