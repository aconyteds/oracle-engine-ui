import { useCampaignContext } from "@context";
import type { RelevantCampaignDetailsFragment } from "@graphql";
import React, { useCallback } from "react";
import { Modal } from "react-bootstrap";
import { CampaignForm } from "./CampaignForm";
import "./CampaignModal.scss";

export const CampaignModal: React.FC = () => {
    const {
        isModalOpen,
        modalCampaign,
        closeCampaignModal,
        refreshCampaigns,
        selectCampaign,
    } = useCampaignContext();

    const isEditMode = !!modalCampaign;

    const handleSuccess = useCallback(
        async (campaign: RelevantCampaignDetailsFragment) => {
            const updatedCampaigns = await refreshCampaigns();
            if (!isEditMode) {
                selectCampaign(campaign.id, updatedCampaigns);
            }
            closeCampaignModal();
        },
        [refreshCampaigns, selectCampaign, closeCampaignModal, isEditMode]
    );

    const handleDelete = useCallback(async () => {
        await refreshCampaigns();
        selectCampaign(null);
        closeCampaignModal();
    }, [refreshCampaigns, selectCampaign, closeCampaignModal]);

    return (
        <Modal
            show={isModalOpen}
            onHide={closeCampaignModal}
            centered
            backdrop="static"
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditMode ? "Edit Campaign" : "Create New Campaign"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <CampaignForm
                    campaign={modalCampaign}
                    onSuccess={handleSuccess}
                    onCancel={closeCampaignModal}
                    onDelete={handleDelete}
                    showCancel
                    showDelete
                />
            </Modal.Body>
        </Modal>
    );
};
