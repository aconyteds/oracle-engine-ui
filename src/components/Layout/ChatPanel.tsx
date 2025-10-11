import React from "react";
import { useThreadsContext } from "@context";
import { Container } from "react-bootstrap";
import "./ChatPanel.scss";
import { MessageInput } from "../CreateMessage";
import { GeneratingMessage, Message } from "../Messages";
import { MessageDetailsFragment } from "@graphql";

export const ChatPanel: React.FC = () => {
    const { selectedThread, messageList, setGenerating, addMessage } =
        useThreadsContext();

    const onGenerationComplete = (message: MessageDetailsFragment) => {
        if (!selectedThread) return;
        setGenerating(false);
        addMessage(message);
    };

    return (
        <div className="chat-panel">
            <div className="chat-messages">
                {selectedThread === null ? (
                    <Container className="empty-state d-flex flex-column justify-content-center align-items-center h-100">
                        <h2 className="text-body mb-4">
                            Welcome to Oracle Engine
                        </h2>
                        <p className="lead text-body-secondary">
                            Start a new conversation by sending a message below
                        </p>
                    </Container>
                ) : (
                    <Container className="messages-container">
                        {messageList.map((message) => (
                            <Message key={message.id} {...message} />
                        ))}
                        <GeneratingMessage
                            onGenerationComplete={onGenerationComplete}
                        />
                    </Container>
                )}
            </div>
            <div className="chat-input">
                <MessageInput />
            </div>
        </div>
    );
};
