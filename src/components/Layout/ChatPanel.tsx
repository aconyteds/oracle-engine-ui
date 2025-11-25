import { useThreadsContext } from "@context";
import React, { useRef } from "react";
import { Container } from "react-bootstrap";
import "./ChatPanel.scss";
import { MessageInput } from "../CreateMessage";
import { Message, ScrollToBottomButton } from "../Messages";
import { ChatHistoryMenu } from "./ChatHistoryMenu";

export const ChatPanel: React.FC = () => {
    const { selectedThread, messageList, isGenerating, generatingContent } =
        useThreadsContext();
    const chatMessagesRef = useRef<HTMLDivElement>(null);

    return (
        <div className="chat-panel">
            <div className="chat-header">
                <div className="chat-title">
                    {selectedThread ? selectedThread.title : "New Chat"}
                </div>
                <ChatHistoryMenu />
            </div>
            <div className="chat-messages" ref={chatMessagesRef}>
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
                        {isGenerating && (
                            <Message
                                content={generatingContent}
                                role="AI Generating"
                                id="generating"
                            />
                        )}
                    </Container>
                )}
            </div>
            <div className="chat-input">
                {selectedThread !== null && (
                    <ScrollToBottomButton containerRef={chatMessagesRef} />
                )}
                <MessageInput />
            </div>
        </div>
    );
};
