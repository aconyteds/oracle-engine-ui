import { useCampaignContext } from "@context";
import {
    CampaignAssetSummaryFragment,
    RecordType,
    useSearchCampaignAssetsQuery,
} from "@graphql";
import { useDebounce } from "@hooks";
import { useAssetModals } from "@signals";
import React, { useEffect, useRef, useState } from "react";
import { Form, InputGroup, ListGroup, Spinner } from "react-bootstrap";
import "./AssetSearch.scss";

interface SearchResultItem {
    asset: CampaignAssetSummaryFragment;
    score: number;
}

export const AssetSearch: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const [assetType, setAssetType] = useState<RecordType | "ANY">("ANY");
    const [limit, setLimit] = useState(5);
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const { openModal } = useAssetModals();
    const { selectedCampaign } = useCampaignContext();

    const { data, loading } = useSearchCampaignAssetsQuery({
        variables: {
            input: {
                campaignId: selectedCampaign?.id || "",
                query: debouncedSearchTerm,
                keywords: debouncedSearchTerm,
                limit: limit,
                minScore: 0.6,
                recordType: assetType === "ANY" ? undefined : assetType,
            },
        },
        skip: !debouncedSearchTerm || !selectedCampaign?.id,
        fetchPolicy: "cache-and-network",
    });

    const assets: SearchResultItem[] = data?.searchCampaignAssets?.assets || [];

    // Handle outside click to close results
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showResults || assets.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev < assets.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (selectedIndex >= 0 && assets[selectedIndex]) {
                handleSelectAsset(assets[selectedIndex].asset);
            }
        } else if (e.key === "Escape") {
            setShowResults(false);
        }
    };

    const handleSelectAsset = (asset: CampaignAssetSummaryFragment) => {
        openModal(asset.recordType, asset.id, asset.name);
        setShowResults(false);
        setSearchTerm("");
    };

    if (!selectedCampaign) return null;

    return (
        <div className="asset-search" ref={searchRef}>
            <InputGroup>
                <Form.Select
                    style={{ maxWidth: "120px" }}
                    value={assetType}
                    onChange={(e) =>
                        setAssetType(e.target.value as RecordType | "ANY")
                    }
                >
                    <option value="ANY">Any</option>
                    <option value={RecordType.Location}>Location</option>
                    <option value={RecordType.Npc}>NPC</option>
                    <option value={RecordType.Plot}>Plot</option>
                </Form.Select>
                <Form.Control
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowResults(true);
                        setSelectedIndex(-1);
                    }}
                    onFocus={() => {
                        if (searchTerm) setShowResults(true);
                    }}
                    onKeyDown={handleKeyDown}
                />
                <Form.Select
                    style={{ maxWidth: "80px" }}
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </Form.Select>
            </InputGroup>

            {showResults && (searchTerm || loading) && (
                <div className="search-results-dropdown">
                    <ListGroup variant="flush">
                        {loading ? (
                            <div className="p-3 text-center">
                                <Spinner animation="border" size="sm" />
                            </div>
                        ) : assets.length > 0 ? (
                            assets.map((item, index) => (
                                <ListGroup.Item
                                    key={item.asset.id}
                                    className={`search-result-item ${
                                        index === selectedIndex ? "active" : ""
                                    }`}
                                    onClick={() =>
                                        handleSelectAsset(item.asset)
                                    }
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <strong>{item.asset.name}</strong>
                                        <small className="text-muted">
                                            {item.asset.recordType}
                                        </small>
                                    </div>
                                </ListGroup.Item>
                            ))
                        ) : (
                            debouncedSearchTerm && (
                                <ListGroup.Item className="p-3 text-center text-muted">
                                    No results found
                                </ListGroup.Item>
                            )
                        )}
                    </ListGroup>
                </div>
            )}
        </div>
    );
};
