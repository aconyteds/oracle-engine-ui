import React from "react";
import { MarkdownRenderer } from "../Common";
import "./Message.scss";

interface MessageProps {
    content: string;
    role: string;
    id: string;
}

export const Message: React.FC<MessageProps> = ({ content, role, id }) => {
    const isUser = role.toLowerCase() === "user";
    const isAssistant = role.toLowerCase() === "assistant";

    return (
        <div key={id} className="mb-3">
            <div
                className={`message p-3 rounded shadow-sm border ${
                    isUser
                        ? "bg-primary text-white border-primary-subtle"
                        : isAssistant
                          ? "bg-light border-light-subtle"
                          : "bg-secondary border-secondary-subtle"
                }`}
                style={{
                    maxWidth: "85%",
                    marginLeft: isUser ? "auto" : "0",
                    marginRight: isUser ? "0" : "auto",
                }}
            >
                <span
                    className={`message-role fw-bold d-block mb-2 small text-uppercase ${
                        isUser ? "text-white opacity-75" : "text-body-secondary"
                    }`}
                >
                    {role}
                </span>
                <div
                    className={`message-content ${
                        isUser ? "text-white" : "text-body"
                    }`}
                >
                    <MarkdownRenderer content={content} />
                </div>
            </div>
        </div>
    );
};
