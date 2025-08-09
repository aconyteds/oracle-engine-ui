import React from "react";
import { Row, Col } from "react-bootstrap";
import { ThemeToggle } from "../Common/ThemeToggle";

export const Header: React.FC = () => {
    return (
        <header className="ps-2">
            <Row className="justify-content-between align-items-center">
                <Col xs="auto">
                    <h1>Oracle-Engine</h1>
                </Col>
                <Col xs="auto">
                    <ThemeToggle />
                </Col>
            </Row>
        </header>
    );
};
