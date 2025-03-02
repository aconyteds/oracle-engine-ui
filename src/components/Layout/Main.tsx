import React from "react";
import { useThreadsContext } from "@context";
import { Col, Container, Row } from "react-bootstrap";
import "./Main.scss";
import { MessageInput } from "../CreateMessage";
import { GeneratingMessage, Message } from "../Messages";
import { MessageDetailsFragment } from "@graphql";

export const Main: React.FC = () => {
    const { selectedThread, messageList, setGenerating, addMessage } =
        useThreadsContext();

    const onGenerationComplete = (message: MessageDetailsFragment) => {
        if (!selectedThread) return;
        // Append the generated message to the thread.
        // This is a simplified version of the actual implementation.
        // In reality, we would use the `sendMessage` function from the context.
        // This is just to show the basic idea.
        addMessage(message);
        setGenerating(false);
    };

    return (
        <div className="main-container">
            <div>
                <Row>
                    <Col xs="auto">
                        <h1>{selectedThread?.title}</h1>
                    </Col>
                </Row>
            </div>
            <div className="message-container">
                {selectedThread === null ? (
                    "Select a thread"
                ) : (
                    <Container className="gap-1">
                        {messageList.map((message) => (
                            <Message key={message.id} {...message} />
                        ))}
                        {selectedThread.generating && (
                            <GeneratingMessage
                                onGenerationComplete={onGenerationComplete}
                            />
                        )}
                    </Container>
                )}
            </div>
            <div>
                <Row>
                    <Col>
                        <MessageInput />
                    </Col>
                </Row>
            </div>
        </div>
    );
};
