import { useCampaignContext } from "@context";
import {
    faChevronDown,
    faEdit,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useMemo } from "react";
import { Dropdown, OverlayTrigger, Popover } from "react-bootstrap";
import "./CampaignSelector.scss";
import { useGetUsageLimitsQuery } from "../../graphql/generated";

export const CampaignSelector: React.FC = () => {
    const {
        selectedCampaign,
        campaignList,
        selectCampaign,
        openCampaignModal,
        loading,
    } = useCampaignContext();

    const { data: usageData } = useGetUsageLimitsQuery({
        fetchPolicy: "network-only",
    });

    const { canCreate, campaignLimit } = useMemo(() => {
        if (!usageData || !usageData.currentUser?.usageLimits?.campaignUsage)
            return {
                canCreate: false,
                campaignLimit: 0,
            };
        const campaignUsage = usageData.currentUser.usageLimits.campaignUsage;
        return {
            canCreate: campaignUsage.canCreate ?? false,
            campaignLimit: campaignUsage.limit ?? 0,
        };
    }, [usageData]);

    const handleSelectCampaign = (campaignId: string) => {
        selectCampaign(campaignId);
    };

    const handleNewCampaign = () => {
        openCampaignModal();
    };

    const handleEditCampaign = () => {
        if (selectedCampaign) {
            openCampaignModal(selectedCampaign);
        }
    };

    return (
        <div className="campaign-selector">
            <Dropdown>
                <Dropdown.Toggle
                    variant="outline-primary"
                    size="sm"
                    id="campaign-dropdown"
                    disabled={loading}
                    className="campaign-toggle d-flex align-items-center gap-2"
                    bsPrefix="btn"
                >
                    {selectedCampaign
                        ? selectedCampaign.name
                        : "Select Campaign"}
                    <FontAwesomeIcon icon={faChevronDown} size="xs" />
                </Dropdown.Toggle>

                <Dropdown.Menu className="campaign-dropdown-menu">
                    {selectedCampaign && (
                        <>
                            <Dropdown.Header className="text-primary">
                                <h4>{selectedCampaign.name}</h4>
                                {selectedCampaign.ruleset && (
                                    <div className="campaign-ruleset text-muted">
                                        {selectedCampaign.ruleset}
                                    </div>
                                )}
                            </Dropdown.Header>
                            <Dropdown.Item onClick={handleEditCampaign}>
                                <FontAwesomeIcon
                                    icon={faEdit}
                                    className="me-2"
                                />
                                Edit Current Campaign
                            </Dropdown.Item>
                        </>
                    )}
                    <Dropdown.Divider />
                    {campaignList.length > 1 && (
                        <>
                            <Dropdown.Header>Campaigns</Dropdown.Header>
                            <div className="campaign-list">
                                {campaignList.map((campaign) => {
                                    if (campaign.id === selectedCampaign?.id)
                                        return null;
                                    return (
                                        <Dropdown.Item
                                            key={campaign.id}
                                            onClick={() =>
                                                handleSelectCampaign(
                                                    campaign.id
                                                )
                                            }
                                            active={
                                                selectedCampaign?.id ===
                                                campaign.id
                                            }
                                        >
                                            <div className="campaign-item">
                                                <div className="campaign-name">
                                                    {campaign.name}
                                                </div>
                                                {campaign.ruleset && (
                                                    <div className="campaign-ruleset">
                                                        {campaign.ruleset}
                                                    </div>
                                                )}
                                            </div>
                                        </Dropdown.Item>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {!canCreate ? (
                        <OverlayTrigger
                            placement="right"
                            overlay={
                                <Popover id="campaign-limit-popover">
                                    <Popover.Header as="h3">
                                        Campaign Limit Reached
                                    </Popover.Header>
                                    <Popover.Body>
                                        You've reached your limit of{" "}
                                        {campaignLimit}{" "}
                                        {campaignLimit === 1
                                            ? "campaign"
                                            : "campaigns"}
                                        . To create more, upgrade your
                                        subscription or delete an existing
                                        campaign.
                                    </Popover.Body>
                                </Popover>
                            }
                        >
                            <span
                                className="d-block"
                                style={{ cursor: "not-allowed" }}
                            >
                                <Dropdown.Item
                                    disabled
                                    className="d-flex align-items-center"
                                    style={{ pointerEvents: "none" }}
                                >
                                    <FontAwesomeIcon
                                        icon={faPlus}
                                        className="me-2"
                                    />
                                    New Campaign
                                </Dropdown.Item>
                            </span>
                        </OverlayTrigger>
                    ) : (
                        <Dropdown.Item onClick={handleNewCampaign}>
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            New Campaign
                        </Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};
