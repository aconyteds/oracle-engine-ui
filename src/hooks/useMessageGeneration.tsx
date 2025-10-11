import {
    MessageDetailsFragment,
    useGenerateMessageSubscription,
} from "@graphql";
import { useCallback, useRef, useState } from "react";

type UseMessageGenerationProps = {
    onMessageComplete: (message: MessageDetailsFragment) => void;
    onError?: (error: Error) => void;
};

export function useMessageGeneration({
    onMessageComplete,
    onError,
}: UseMessageGenerationProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [generatingContent, setGeneratingContent] = useState("");
    const generatingContentRef = useRef("");

    // Subscribe when we have an active thread
    useGenerateMessageSubscription({
        variables: {
            generateMessageInput: {
                threadId: activeThreadId || "",
            },
        },
        skip: !activeThreadId || !isGenerating,
        onData: ({ data }) => {
            const generateMessage = data?.data?.generateMessage;
            if (!generateMessage) return;

            const { content, message: newMessage } = generateMessage;

            if (newMessage) {
                // Generation complete
                generatingContentRef.current = "";
                setGeneratingContent("");
                setIsGenerating(false);
                setActiveThreadId(null);
                onMessageComplete(newMessage);
                return;
            }

            // Append incremental updates (thinking, reasoning, etc.)
            if (content) {
                generatingContentRef.current += content;
                setGeneratingContent(generatingContentRef.current);
            }
        },
        onError: (err) => {
            setIsGenerating(false);
            setActiveThreadId(null);
            generatingContentRef.current = "";
            setGeneratingContent("");
            if (onError) {
                onError(err as Error);
            }
        },
    });

    const startGeneration = useCallback((threadId: string) => {
        generatingContentRef.current = "";
        setGeneratingContent("");
        setActiveThreadId(threadId);
        setIsGenerating(true);
    }, []);

    const stopGeneration = useCallback(() => {
        setIsGenerating(false);
        setActiveThreadId(null);
        generatingContentRef.current = "";
        setGeneratingContent("");
    }, []);

    return {
        isGenerating,
        activeThreadId,
        generatingContent,
        generatingContentRef,
        startGeneration,
        stopGeneration,
    };
}
