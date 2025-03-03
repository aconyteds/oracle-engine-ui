import React from "react";
import { Col, Row } from "react-bootstrap";
import "./Message.scss";

interface MessageProps {
    content: string;
    role: string;
    id: string;
}

export const Message: React.FC<MessageProps> = ({ content, role, id }) => {
    return (
        <Row xs="auto" key={id}>
            <Col>
                <div className="message">
                    <span className="message-role">{role}</span>
                    <div className="message-content">{content}</div>
                </div>
            </Col>
        </Row>
    );
};
