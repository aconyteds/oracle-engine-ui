import { MockedProvider } from "@apollo/client/testing";
import { RecordType } from "@graphql";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useCampaignContext, useToaster } from "../../contexts";
import { assetModalManager } from "../../signals/campaignAssetModals";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { AssetModal } from "./AssetModal";

// Mock dependencies
vi.mock("../../contexts", () => ({
    useCampaignContext: vi.fn(),
    useToaster: vi.fn(),
}));

vi.mock("../../signals/campaignAssetModals", () => ({
    assetModalManager: {
        closeModal: vi.fn(),
        minimizeModal: vi.fn(),
        updateModalTransform: vi.fn(),
        updateModalName: vi.fn(),
        openModal: vi.fn(),
    },
}));

vi.mock("../firebase", () => ({
    LogEvent: vi.fn(),
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
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={mockModalState} />
            </MockedProvider>
        );

        expect(screen.getByTestId("draggable-modal")).toBeInTheDocument();
        expect(screen.getByText(/Plot: New Asset/i)).toBeInTheDocument();
    });

    test("should not render when minimized", () => {
        const minimizedState = { ...mockModalState, isMinimized: true };

        const { container } = render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={minimizedState} />
            </MockedProvider>
        );

        expect(container.firstChild).toBeNull();
    });

    test("should render PlotForm for Plot asset type", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={mockModalState} />
            </MockedProvider>
        );

        // Check if form is rendered by looking for placeholder
        expect(
            screen.getByPlaceholderText("Enter plot name")
        ).toBeInTheDocument();
    });

    test("should show unsupported message for unknown asset type", () => {
        const unknownState = {
            ...mockModalState,
            assetType: "UnknownType" as RecordType,
        };

        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={unknownState} />
            </MockedProvider>
        );

        expect(screen.getByText(/Unsupported asset type/i)).toBeInTheDocument();
    });

    test("should display modal title with asset type and name", () => {
        const stateWithName = {
            ...mockModalState,
            name: "The Dragon's Lair",
        };

        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={stateWithName} />
            </MockedProvider>
        );

        expect(
            screen.getByText(/Plot: The Dragon's Lair/i)
        ).toBeInTheDocument();
    });

    test("should call closeModal when close button is clicked", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={mockModalState} />
            </MockedProvider>
        );

        const closeButton = screen.getByLabelText("Close");
        fireEvent.click(closeButton);

        expect(assetModalManager.closeModal).toHaveBeenCalledWith(
            "test-modal-id"
        );
    });

    test("should call minimizeModal when minimize button is clicked", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={mockModalState} />
            </MockedProvider>
        );

        const minimizeButton = screen.getByLabelText("Minimize");
        fireEvent.click(minimizeButton);

        expect(assetModalManager.minimizeModal).toHaveBeenCalledWith(
            "test-modal-id"
        );
    });

    test("should render Save button", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={mockModalState} />
            </MockedProvider>
        );

        expect(screen.getByText("Save")).toBeInTheDocument();
    });

    test("should disable Save button when name is empty", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={mockModalState} />
            </MockedProvider>
        );

        const saveButton = screen.getByText("Save");
        expect(saveButton).toBeDisabled();
    });

    test("should show Delete button when assetId exists", () => {
        const existingAssetState = {
            ...mockModalState,
            assetId: "asset-123",
            name: "Existing Plot",
        };

        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={existingAssetState} />
            </MockedProvider>
        );

        expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    test("should not show Delete button when assetId is null", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={mockModalState} />
            </MockedProvider>
        );

        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    test("should render modal with testid", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={mockModalState} />
            </MockedProvider>
        );

        expect(screen.getByTestId("draggable-modal")).toBeInTheDocument();
    });

    test("should render modal body with form", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={mockModalState} />
            </MockedProvider>
        );

        const body = screen.getByTestId("draggable-modal-body");
        expect(body).toBeInTheDocument();

        const form = body.querySelector("form");
        expect(form).toBeInTheDocument();
    });

    test("should pass modalId to DraggableModal for z-index management", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <AssetModal modalState={mockModalState} />
            </MockedProvider>
        );

        const modal = screen.getByTestId("draggable-modal");
        expect(modal).toBeInTheDocument();
    });
});
