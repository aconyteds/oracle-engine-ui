// GeneratedMessageSubscriber.tsx
import React, { useState } from "react";
import {
    MessageDetailsFragment,
    useGenerateMessageSubscription,
} from "@graphql";
import { useThreadsContext } from "@context";
import { Message } from "./Message";

type GeneratingMessageProps = {
    onGenerationComplete: (message: MessageDetailsFragment) => void;
};

export const GeneratingMessage: React.FC<GeneratingMessageProps> = ({
    onGenerationComplete,
}) => {
    const { selectedThread } = useThreadsContext();
    const [generatedContent, setGeneratedContent] = useState("");

    useGenerateMessageSubscription({
        variables: {
            generateMessageInput: {
                threadId: selectedThread?.id || "",
            },
        },
        // We always subscribe as long as this component is rendered.
        skip: !selectedThread?.generating,
        onData: ({ data }) => {
            const generateMessage = data?.data?.generateMessage;
            if (!generateMessage) return;

            const { content, message: newMessage } = generateMessage;
            if (newMessage) {
                // Reset when the message is sent
                setGeneratedContent("");
                onGenerationComplete(newMessage);
                return;
            }
            // Append generated content.
            setGeneratedContent((prev) => prev + content);
        },
    });

    if (!selectedThread?.generating) return null;

    return (
        <Message
            content={generatedContent}
            role="AI Generating"
            id="generating"
        />
    );
};
