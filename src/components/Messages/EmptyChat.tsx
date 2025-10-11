import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { MessageInput } from "../CreateMessage";
import "./EmptyChat.scss";

export const EmptyChat: React.FC = () => {
    return (
        <Container className="empty-chat-container d-flex flex-column justify-content-center align-items-center">
            <Row className="text-center mb-4">
                <Col>
                    <h1 className="text-body mb-4">Welcome to Oracle Engine</h1>
                    <p className="lead text-body-secondary">
                        Start a new conversation by sending a message below
                    </p>
                </Col>
            </Row>
            <Row className="w-75">
                <Col>
                    <MessageInput />
                </Col>
            </Row>
        </Container>
    );
};
