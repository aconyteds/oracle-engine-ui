import { useCampaignContext } from "@context";
import type { RelevantCampaignDetailsFragment } from "@graphql";
import React, { ReactNode, useCallback, useMemo } from "react";
import { Button, Card, Container } from "react-bootstrap";
import { CampaignForm } from "./CampaignForm";

type CampaignRequirementProps = {
    children: ReactNode;
};

export const CampaignRequirement: React.FC<CampaignRequirementProps> = ({
    children,
}) => {
    const {
        selectedCampaign,
        loading,
        campaignList,
        refreshCampaigns,
        selectCampaign,
    } = useCampaignContext();

    // Show existing campaigns if user has them
    const hasExistingCampaigns = useMemo(
        () => campaignList.length > 0,
        [campaignList.length]
    );

    const handleSelectExisting = useCallback(
        (campaignId: string) => {
            selectCampaign(campaignId);
        },
        [selectCampaign]
    );

    const handleSuccess = useCallback(
        async (campaign: RelevantCampaignDetailsFragment) => {
            const updatedCampaigns = await refreshCampaigns();
            selectCampaign(campaign.id, updatedCampaigns);
        },
        [refreshCampaigns, selectCampaign]
    );

    // Show loading state
    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center h-100">
                <div className="text-center">
                    <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading campaigns...</p>
                </div>
            </Container>
        );
    }

    // Show campaign creation form if no campaign selected
    if (!selectedCampaign) {
        return (
            <Container className="d-flex justify-content-center align-items-center h-100">
                <Card style={{ maxWidth: "600px", width: "100%" }}>
                    <Card.Header>
                        <h3 className="mb-0">Campaign Required</h3>
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-4">
                            You need to select or create a campaign to continue
                            using Oracle Engine.
                        </p>

                        {hasExistingCampaigns && (
                            <>
                                <h5>Select Existing Campaign</h5>
                                <div className="mb-4">
                                    {campaignList.map((campaign) => (
                                        <Button
                                            key={campaign.id}
                                            variant="outline-primary"
                                            className="w-100 mb-2 text-start"
                                            onClick={() =>
                                                handleSelectExisting(
                                                    campaign.id
                                                )
                                            }
                                        >
                                            <div>
                                                <strong>{campaign.name}</strong>
                                                {campaign.ruleset && (
                                                    <small className="d-block text-muted">
                                                        {campaign.ruleset}
                                                    </small>
                                                )}
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                                <hr />
                                <h5 className="mb-3">Or Create New Campaign</h5>
                            </>
                        )}

                        {!hasExistingCampaigns && (
                            <h5 className="mb-3">Create Your First Campaign</h5>
                        )}

                        <CampaignForm
                            onSuccess={handleSuccess}
                            submitButtonClassName="w-100"
                        />
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // Campaign is selected, render children
    return <>{children}</>;
};
