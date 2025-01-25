import React from "react";
import { useThreadsContext } from "@context";
import { Col, Container, Row } from "react-bootstrap";
import "./Main.scss";
import { MessageInput } from "../CreateMessage";

export const Main: React.FC = () => {
    const { selectedThread, messageList, newMessageContent } =
        useThreadsContext();

    return (
        <div className="main-container">
            <Row>
                <Col xs="auto">
                    <h1>{selectedThread?.title}</h1>
                </Col>
            </Row>
            {selectedThread === null ? (
                "Select a thread"
            ) : (
                <div className="message-container">
                    <Container className="gap-1">
                        {messageList.map(({ content, role, id }) => (
                            <Row xs="auto" key={id}>
                                <Col>
                                    <span>{role}</span>
                                    <div>{content}</div>
                                </Col>
                            </Row>
                        ))}
                        {newMessageContent && (
                            <Row xs="auto">
                                <Col>
                                    <span>AI</span>
                                    <div>{newMessageContent}</div>
                                </Col>
                            </Row>
                        )}
                    </Container>
                </div>
            )}
            <Row>
                <Col>
                    <MessageInput />
                </Col>
            </Row>
        </div>
    );
};
