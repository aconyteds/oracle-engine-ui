import { useCampaignContext } from "@context";
import {
    faChevronDown,
    faEdit,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Dropdown } from "react-bootstrap";
import "./CampaignSelector.scss";

export const CampaignSelector: React.FC = () => {
    const {
        selectedCampaign,
        campaignList,
        selectCampaign,
        openCampaignModal,
        loading,
    } = useCampaignContext();

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
                                {selectedCampaign.name}
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
                        <Dropdown.Header>Campaigns</Dropdown.Header>
                    )}
                    <div className="campaign-list">
                        {campaignList.map((campaign) => {
                            if (campaign.id === selectedCampaign?.id)
                                return null;
                            return (
                                <Dropdown.Item
                                    key={campaign.id}
                                    onClick={() =>
                                        handleSelectCampaign(campaign.id)
                                    }
                                    active={
                                        selectedCampaign?.id === campaign.id
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
                    <Dropdown.Item onClick={handleNewCampaign}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        New Campaign
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};
