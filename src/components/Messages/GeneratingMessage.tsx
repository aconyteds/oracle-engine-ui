// GeneratedMessageSubscriber.tsx
import React, { useEffect, useRef, useState } from "react";
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
    // Use a ref to avoid stale closures when appending content
    const contentRef = useRef(generatedContent);

    useEffect(() => {
        contentRef.current = generatedContent;
    }, [generatedContent]);

    useGenerateMessageSubscription({
        variables: {
            generateMessageInput: {
                threadId: selectedThread?.id || "",
            },
        },
        // We always subscribe as long as this component is rendered.
        skip: !selectedThread?.generating,
        onData: ({ data }) => {
            if (!data?.data?.generateMessage) return;
            const { content, message: newMessage } =
                data?.data?.generateMessage;
            if (newMessage) {
                onGenerationComplete(newMessage);
                return;
            }
            // Append generated content.
            setGeneratedContent((prev) => {
                return prev + content;
            });
        },
        onComplete: () => {
            selectedThread!.generating = false;
        },
    });

    return <Message content={generatedContent} role="AI" id="generating" />;
};
