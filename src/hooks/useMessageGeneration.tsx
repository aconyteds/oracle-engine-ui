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
    onAssetModified?: (assetType: string, assetId: string) => void;
};

export function useMessageGeneration({
    showDebug = false,
    onMessageComplete,
    onError,
    onAssetModified,
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

            // Check for asset creation/update patterns
            // Pattern: "Created [Name](Type:id)" or "Updated [Name](Type:id)"
            // where Type is NPC, Location, or Plot
            if (responseType === ResponseType.Intermediate && onAssetModified) {
                const assetPattern =
                    /(Created|Updated)\s+\[([^\]]+)\]\((NPC|Location|Plot):([^)]+)\)/;
                const match = content.match(assetPattern);
                if (match) {
                    const assetType = match[3];
                    const assetId = match[4];
                    onAssetModified(assetType, assetId);
                }
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
