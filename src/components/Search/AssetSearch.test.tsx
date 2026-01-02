/** biome-ignore-all lint/suspicious/noExplicitAny: test files can use any to simulate failures as needed*/
import { MockedProvider } from "@apollo/client/testing";
import { useCampaignContext } from "@context";
import { RecordType, SearchCampaignAssetsDocument } from "@graphql";
import { useAssetModals } from "@signals";
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AssetSearch } from "./AssetSearch";

// Mock the context and signals
vi.mock("@context", () => ({
    useCampaignContext: vi.fn(),
}));

vi.mock("@signals", () => ({
    useAssetModals: vi.fn(),
}));

const mockOpenModal = vi.fn();

const mockCampaign = {
    id: "campaign-1",
    name: "Test Campaign",
};

const mockAssets = [
    {
        __typename: "CampaignAssetSearchResult",
        asset: {
            __typename: "CampaignAsset",
            id: "asset-1",
            name: "Test Location",
            recordType: RecordType.Location,
            gmSummary: "A test location",
            updatedAt: "2023-01-01",
        },
        score: 1,
    },
    {
        __typename: "CampaignAssetSearchResult",
        asset: {
            __typename: "CampaignAsset",
            id: "asset-2",
            name: "Test NPC",
            recordType: RecordType.Npc,
            gmSummary: "A test NPC",
            updatedAt: "2023-01-01",
        },
        score: 0.8,
    },
];

const mocks = [
    {
        request: {
            query: SearchCampaignAssetsDocument,
            variables: {
                input: {
                    campaignId: "campaign-1",
                    query: "Test",
                    keywords: "Test",
                    limit: 5,
                    minScore: 0.6,
                    recordType: undefined,
                },
            },
        },
        result: {
            data: {
                searchCampaignAssets: {
                    __typename: "SearchCampaignAssetsPayload",
                    assets: mockAssets,
                },
            },
        },
    },
    {
        request: {
            query: SearchCampaignAssetsDocument,
            variables: {
                input: {
                    campaignId: "campaign-1",
                    query: "NoResult",
                    keywords: "NoResult",
                    limit: 5,
                    minScore: 0.6,
                    recordType: undefined,
                },
            },
        },
        result: {
            data: {
                searchCampaignAssets: {
                    __typename: "SearchCampaignAssetsPayload",
                    assets: [],
                },
            },
        },
    },
];

describe("AssetSearch", () => {
    beforeEach(() => {
        (useCampaignContext as any).mockReturnValue({
            selectedCampaign: mockCampaign,
        });
        (useAssetModals as any).mockReturnValue({
            openModal: mockOpenModal,
        });
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders search input", () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <AssetSearch />
            </MockedProvider>
        );
        expect(
            screen.getByPlaceholderText("Search assets...")
        ).toBeInTheDocument();
    });

    it("searches and displays results", async () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <AssetSearch />
            </MockedProvider>
        );

        const input = screen.getByPlaceholderText("Search assets...");
        fireEvent.change(input, { target: { value: "Test" } });

        // Wait for debounce and query
        await waitFor(() => {
            expect(screen.getByText("Test Location")).toBeInTheDocument();
            expect(screen.getByText("Test NPC")).toBeInTheDocument();
        });
    });

    it("opens modal on selection", async () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <AssetSearch />
            </MockedProvider>
        );

        const input = screen.getByPlaceholderText("Search assets...");
        fireEvent.change(input, { target: { value: "Test" } });

        await waitFor(() => {
            expect(screen.getByText("Test Location")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Test Location"));

        expect(mockOpenModal).toHaveBeenCalledWith(
            RecordType.Location,
            "asset-1",
            "Test Location"
        );
    });

    it("does not render if no campaign selected", () => {
        (useCampaignContext as any).mockReturnValue({
            selectedCampaign: null,
        });

        const { container } = render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <AssetSearch />
            </MockedProvider>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("renders no results found when no results are returned", async () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <AssetSearch />
            </MockedProvider>
        );

        const input = screen.getByPlaceholderText("Search assets...");
        fireEvent.change(input, { target: { value: "NoResult" } });

        await waitFor(() => {
            expect(screen.getByText("No results found")).toBeInTheDocument();
        });
    });
});
