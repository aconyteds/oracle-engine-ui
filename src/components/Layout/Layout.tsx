import React from "react";
import { Row, Col } from "react-bootstrap";
import { Main } from "./Main";
import { Header } from "./Header";
import { LeftPanel } from "../LeftPanel";
import "./Layout.scss";
import { HealthCheck } from "../HealthCheck";

export const Layout: React.FC = () => {
    return (
        <div className="root-container">
            <div>
                <Header />
            </div>
            <div className="content-container">
                <LeftPanel />
                <span>
                    <Main />
                </span>
            </div>
            <div>
                <Row className="flex-shrink-0">
                    <Col>
                        <HealthCheck />
                    </Col>
                </Row>
            </div>
        </div>
    );
};
