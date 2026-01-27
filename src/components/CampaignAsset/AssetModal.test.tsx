import { InMemoryCache } from "@apollo/client";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import {
    GetCampaignAssetDocument,
    PlotStatus,
    RecordType,
    Urgency,
} from "@graphql";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useCampaignContext, useToaster } from "../../contexts";
import { assetModalManager } from "../../signals/campaignAssetModals";
import { cleanup, fireEvent, render, screen, waitFor } from "../../test-utils";
import { AssetModal } from "./AssetModal";

// Create cache without __typename to avoid needing it in mocks
const createCache = () => new InMemoryCache({ addTypename: false });

// Wrapper component for tests
const renderWithMocks = (
    ui: React.ReactElement,
    mocks: MockedResponse[] = []
) => {
    return render(
        <MockedProvider mocks={mocks} cache={createCache()}>
            {ui}
        </MockedProvider>
    );
};

// Mock individual context files to preserve ThemeProvider for test-utils wrapper
vi.mock("../../contexts/Campaign.context", () => ({
    useCampaignContext: vi.fn(),
    CampaignProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../../contexts/Toaster.context", () => ({
    useToaster: vi.fn(),
    ToasterProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../../signals/campaignAssetModals", () => ({
    assetModalManager: {
        closeModal: vi.fn(),
        minimizeModal: vi.fn(),
        maximizeModal: vi.fn(),
        updateModalTransform: vi.fn(),
        updateModalName: vi.fn(),
        openModal: vi.fn(),
        markAssetStale: vi.fn(),
        clearStaleFlag: vi.fn(),
    },
    subscribeToAssetStale: vi.fn().mockReturnValue(vi.fn()),
    useAssetModalZIndex: vi.fn().mockReturnValue({
        zIndex: 1050,
        bringToFront: vi.fn(),
    }),
}));

vi.mock("../firebase", async () => {
    const actual = await vi.importActual("../firebase");
    return {
        ...actual,
        LogEvent: vi.fn(),
    };
});

// Mock formatRelativeTime for VersionHistoryDropdown
vi.mock("../../utils", () => ({
    formatRelativeTime: () => "some time",
}));

const mockModalState = {
    modalId: "test-modal-id",
    assetId: null,
    assetType: RecordType.Plot,
    name: "New Asset",
    isMinimized: false,
    position: undefined,
};

const mockCampaign = {
    id: "campaign-123",
    name: "Test Campaign",
    ruleset: "D&D 5e",
    setting: "Fantasy",
    tone: "Heroic",
};

// Default asset data for existing asset tests
const defaultAsset = {
    id: "asset-123",
    campaignId: "campaign-123",
    name: "Existing Plot",
    recordType: RecordType.Plot,
    gmSummary: "",
    gmNotes: "",
    playerSummary: "",
    playerNotes: "",
    updatedAt: "2024-01-01",
    data: {
        status: PlotStatus.Rumored,
        urgency: Urgency.Ongoing,
    },
    versions: [] as Array<{ id: string; name: string; createdAt: string }>,
};

// Factory to create GetCampaignAsset mock with optional overrides
const createAssetMock = (
    assetId: string,
    assetOverrides: Partial<typeof defaultAsset> = {}
) => ({
    request: {
        query: GetCampaignAssetDocument,
        variables: { input: { assetId } },
    },
    result: {
        data: {
            getCampaignAsset: {
                asset: { ...defaultAsset, id: assetId, ...assetOverrides },
            },
        },
    },
});

// Common modal state for existing asset tests
const existingAssetModalState = {
    ...mockModalState,
    assetId: "asset-123",
    name: "Existing Plot",
};

describe("AssetModal Component", () => {
    const mockToast = {
        success: vi.fn(),
        danger: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useCampaignContext).mockReturnValue({
            selectedCampaign: mockCampaign,
            campaignList: [],
            selectCampaign: vi.fn(),
            loading: false,
            openCampaignModal: vi.fn(),
            closeCampaignModal: vi.fn(),
            modalCampaign: null,
            isModalOpen: false,
            refreshCampaigns: vi.fn(),
        });

        vi.mocked(useToaster).mockReturnValue({
            toast: mockToast,
        });
    });

    afterEach(() => {
        cleanup();
    });

    test("should render modal when not minimized", () => {
        renderWithMocks(<AssetModal modalState={mockModalState} />);

        expect(screen.getByTestId("draggable-modal")).toBeInTheDocument();
        expect(screen.getByText(/Plot: New Asset/i)).toBeInTheDocument();
    });

    test("should have minimized class when minimized", () => {
        const minimizedState = { ...mockModalState, isMinimized: true };

        renderWithMocks(<AssetModal modalState={minimizedState} />);

        const modal = screen.getByTestId("draggable-modal");
        expect(modal).toHaveClass("minimized");
    });

    test("should render PlotForm for Plot asset type", () => {
        renderWithMocks(<AssetModal modalState={mockModalState} />);

        // Check if form is rendered by looking for placeholder
        expect(
            screen.getByPlaceholderText("Enter plot name")
        ).toBeInTheDocument();
    });

    test("should throw error for unknown asset type", () => {
        const unknownState = {
            ...mockModalState,
            assetType: "UnknownType" as RecordType,
        };

        // The component should throw an error for unknown asset types
        // since createDefaultFormData throws for invalid types
        expect(() => {
            renderWithMocks(<AssetModal modalState={unknownState} />);
        }).toThrow("Unknown asset type: UnknownType");
    });

    test("should display modal title with asset type and name", () => {
        const stateWithName = {
            ...mockModalState,
            name: "The Dragon's Lair",
        };

        renderWithMocks(<AssetModal modalState={stateWithName} />);

        expect(
            screen.getByText(/Plot: The Dragon's Lair/i)
        ).toBeInTheDocument();
    });

    test("should call closeModal when close button is clicked", () => {
        renderWithMocks(<AssetModal modalState={mockModalState} />);

        const closeButton = screen.getByLabelText("Close");
        fireEvent.click(closeButton);

        expect(assetModalManager.closeModal).toHaveBeenCalledWith(
            "test-modal-id"
        );
    });

    test("should call minimizeModal when minimize button is clicked", () => {
        renderWithMocks(<AssetModal modalState={mockModalState} />);

        const minimizeButton = screen.getByLabelText("Minimize");
        fireEvent.click(minimizeButton);

        expect(assetModalManager.minimizeModal).toHaveBeenCalledWith(
            "test-modal-id"
        );
    });

    test("should render Save button", () => {
        renderWithMocks(<AssetModal modalState={mockModalState} />);

        expect(screen.getByText("Save")).toBeInTheDocument();
    });

    test("should disable Save button when name is empty", () => {
        renderWithMocks(<AssetModal modalState={mockModalState} />);

        const saveButton = screen.getByText("Save");
        expect(saveButton).toBeDisabled();
    });

    test("should show Delete button when assetId exists", () => {
        renderWithMocks(<AssetModal modalState={existingAssetModalState} />, [
            createAssetMock("asset-123"),
        ]);

        expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    test("should not show Delete button when assetId is null", () => {
        renderWithMocks(<AssetModal modalState={mockModalState} />);

        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    test("should render modal with testid", () => {
        renderWithMocks(<AssetModal modalState={mockModalState} />);

        expect(screen.getByTestId("draggable-modal")).toBeInTheDocument();
    });

    test("should render modal body with form", () => {
        renderWithMocks(<AssetModal modalState={mockModalState} />);

        const body = screen.getByTestId("draggable-modal-body");
        expect(body).toBeInTheDocument();

        const form = body.querySelector("form");
        expect(form).toBeInTheDocument();
    });

    test("should pass z-index and onInteract to DraggableModal", () => {
        renderWithMocks(<AssetModal modalState={mockModalState} />);

        const modal = screen.getByTestId("draggable-modal");
        expect(modal).toBeInTheDocument();
        // Check if z-index is applied (mocked value is 1050)
        expect(modal).toHaveStyle({ zIndex: "1050" });
    });

    describe("Header Button (Edit/View Toggle)", () => {
        test("should not show header button for new assets (no assetId)", () => {
            renderWithMocks(<AssetModal modalState={mockModalState} />);

            // New assets don't have Edit/View header button
            expect(screen.queryByLabelText("Edit")).not.toBeInTheDocument();
            expect(screen.queryByLabelText("View")).not.toBeInTheDocument();
        });

        test("should show Edit header button for existing assets in view mode", async () => {
            renderWithMocks(
                <AssetModal modalState={existingAssetModalState} />,
                [createAssetMock("asset-123")]
            );

            // Should show Edit button in header (view mode is default for existing assets)
            await waitFor(() => {
                expect(screen.getByLabelText("Edit")).toBeInTheDocument();
            });
        });

        test("should toggle between Edit and View icons when header button is clicked", async () => {
            renderWithMocks(
                <AssetModal modalState={existingAssetModalState} />,
                [createAssetMock("asset-123")]
            );

            // Wait for Edit button to appear (view mode)
            await waitFor(() => {
                expect(screen.getByLabelText("Edit")).toBeInTheDocument();
            });

            // Click to switch to edit mode
            fireEvent.click(screen.getByLabelText("Edit"));

            // Should now show View button
            await waitFor(() => {
                expect(screen.getByLabelText("View")).toBeInTheDocument();
            });
        });
    });

    describe("Version History Dropdown", () => {
        test("should not show History button for new assets", () => {
            renderWithMocks(<AssetModal modalState={mockModalState} />);

            expect(screen.queryByText("History")).not.toBeInTheDocument();
        });

        test("should not show History button when no versions exist", async () => {
            renderWithMocks(
                <AssetModal modalState={existingAssetModalState} />,
                [createAssetMock("asset-123", { versions: [] })]
            );

            // Wait for modal to load
            await waitFor(() => {
                expect(
                    screen.getByTestId("draggable-modal")
                ).toBeInTheDocument();
            });

            // History button should not be present when no versions
            expect(screen.queryByText("History")).not.toBeInTheDocument();
        });

        test("should show History button when versions exist", async () => {
            const versions = [
                {
                    id: "version-1",
                    name: "Previous Version",
                    createdAt: "2024-01-01T10:00:00Z",
                },
            ];

            renderWithMocks(
                <AssetModal modalState={existingAssetModalState} />,
                [createAssetMock("asset-123", { versions })]
            );

            // Wait for History button to appear
            await waitFor(() => {
                expect(screen.getByText("History")).toBeInTheDocument();
            });
        });

        test("should have multiple versions in the dropdown data", async () => {
            const versions = [
                {
                    id: "version-1",
                    name: "First Save",
                    createdAt: "2024-01-01T10:00:00Z",
                },
                {
                    id: "version-2",
                    name: "Second Save",
                    createdAt: "2024-01-02T10:00:00Z",
                },
            ];

            renderWithMocks(
                <AssetModal modalState={existingAssetModalState} />,
                [createAssetMock("asset-123", { versions })]
            );

            // Wait for History button to appear (indicates versions are loaded)
            await waitFor(() => {
                expect(screen.getByText("History")).toBeInTheDocument();
            });

            // The History button presence confirms versions were loaded
            // Dropdown content testing is better done in VersionHistoryDropdown.test.tsx
            const historyButton = screen.getByText("History").closest("button");
            expect(historyButton).not.toBeDisabled();
        });
    });
});
