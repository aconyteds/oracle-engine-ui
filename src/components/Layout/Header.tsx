import React from "react";
import { Row, Col } from "react-bootstrap";

export const Header: React.FC = () => {
    return (
        <header>
            <Row justifyContent="space-between">
                <Col xs="auto">
                    <h1>Oracle-Engine</h1>
                </Col>
            </Row>
        </header>
    );
};
