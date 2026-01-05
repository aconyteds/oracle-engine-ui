import {
    MessageDetailsFragment,
    ResponseType,
    useGenerateMessageSubscription,
} from "@graphql";
import { useCallback, useRef, useState } from "react";

type UseMessageGenerationProps = {
    showDebug?: boolean;
    onMessageComplete: (message: MessageDetailsFragment) => void;
    onError?: (error: Error) => void;
};

export function useMessageGeneration({
    showDebug = false,
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

            const {
                content,
                message: newMessage,
                responseType,
            } = generateMessage;

            if (newMessage) {
                // Generation complete
                generatingContentRef.current = "";
                setGeneratingContent("");
                setIsGenerating(false);
                setActiveThreadId(null);
                onMessageComplete(newMessage);
                return;
            }
            if (!content) return;

            let showContent = responseType === ResponseType.Intermediate;

            if (showDebug) {
                showContent = [
                    ResponseType.Intermediate,
                    ResponseType.Debug,
                    ResponseType.Reasoning,
                ].some((type) => responseType === type);
                console.debug(`${responseType}: ${content}`);
            }

            if (!showContent) {
                return;
            }
            generatingContentRef.current +=
                content.length > 0 ? `\n\n${content}` : content;
            setGeneratingContent(generatingContentRef.current);
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
