import React from "react";
import { Col, Row } from "react-bootstrap";
import { CampaignSelector } from "../Campaign";
import { ThemeToggle } from "../Common/ThemeToggle";

export const Header: React.FC = () => {
    return (
        <header className="ps-2">
            <Row className="justify-content-between align-items-center">
                <Col xs="auto" className="d-flex align-items-center gap-2">
                    <div>
                        <h1 className="mb-0">Oracle-Engine</h1>
                    </div>
                    <CampaignSelector />
                </Col>
                <Col xs="auto" className="d-flex align-items-center gap-2">
                    <ThemeToggle />
                </Col>
            </Row>
        </header>
    );
};
