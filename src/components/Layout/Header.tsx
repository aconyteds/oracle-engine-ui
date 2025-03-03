import React from "react";
import { Row, Col } from "react-bootstrap";

export const Header: React.FC = () => {
    return (
        <header className="ps-2">
            <Row className="justify-content-between align-items-center">
                <Col xs="auto">
                    <h1>Oracle-Engine</h1>
                </Col>
            </Row>
        </header>
    );
};
