import { faCircleQuestion, faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Button, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { CampaignSelector } from "../Campaign";
import { AssetManager } from "../CampaignAsset";
import { AppFeedbackModal } from "../Common/AppFeedbackModal";
import { ThemeToggle } from "../Common/ThemeToggle";
import { AssetSearch } from "../Search";

type HeaderProps = {
    onShowIntro: () => void;
};

export const Header: React.FC<HeaderProps> = ({ onShowIntro }) => {
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    return (
        <header className="ps-2">
            <Row className="justify-content-between align-items-center">
                <Col xs="auto" className="d-flex align-items-center gap-2">
                    <div>
                        <h1 className="mb-0">Oracle-Engine</h1>
                    </div>
                    <CampaignSelector />
                    <AssetManager />
                </Col>
                <Col className="d-flex justify-content-center">
                    <AssetSearch />
                </Col>
                <Col xs="auto" className="d-flex align-items-center gap-2">
                    <OverlayTrigger
                        placement="bottom"
                        overlay={
                            <Tooltip id="help-tooltip">
                                Application Features
                            </Tooltip>
                        }
                    >
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={onShowIntro}
                            aria-label="Show application help"
                        >
                            <FontAwesomeIcon icon={faCircleQuestion} />
                        </Button>
                    </OverlayTrigger>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowFeedbackModal(true)}
                    >
                        <FontAwesomeIcon icon={faComment} />
                        <span className="d-none d-md-inline ms-2">
                            Feedback
                        </span>
                    </Button>
                    <ThemeToggle />
                </Col>
            </Row>
            <AppFeedbackModal
                show={showFeedbackModal}
                onHide={() => setShowFeedbackModal(false)}
            />
        </header>
    );
};
