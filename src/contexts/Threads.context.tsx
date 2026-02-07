import { useApolloClient } from "@apollo/client";
import {
    GetThreadByIdQueryVariables,
    ListCampaignAssetsQueryVariables,
    MessageDetailsFragment,
    ThreadDetailsFragment,
    useCreateMessageMutation,
    useGetActiveGenerationsLazyQuery,
    useGetMyThreadsLazyQuery,
    useGetThreadByIdQuery,
    useUpdateThreadMutation,
} from "@graphql";
import { useArray, useMap, useSessionStorage } from "@hooks";
import * as Sentry from "@sentry/react";
import {
    generationManager,
    notifyAssetStale,
    selectedThreadIdSignal,
    useGenerationState,
} from "@signals";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { LogEvent } from "../components/firebase";
import { useCampaignContext } from "./Campaign.context";
import { useToaster } from "./Toaster.context";
import { useUserContext } from "./User.context";

type ThreadsContextPayload = {
    threadList: ThreadDetailsFragment[];
    loading: boolean;
    selectThread: (threadId: string | null) => void;
    selectedThread: ThreadDetailsFragment | null;
    selectedThreadId: string;
    messageList: MessageDetailsFragment[];
    sendMessage: (content: string) => Promise<void>;
    isGenerating: boolean;
    generatingContent: string;
    canStartGeneration: boolean;
    abortCurrentGeneration: () => Promise<void>;
    refreshThreads: () => Promise<Map<string, ThreadDetailsFragment>>;
    togglePinThread: (threadId: string, pin: boolean) => Promise<void>;
};

const ThreadsContext = createContext<ThreadsContextPayload | undefined>(
    undefined
);

type ThreadsProviderProps = {
    children: React.ReactNode;
};

export function useThreadsContext() {
    const context = useContext(ThreadsContext);
    if (!context) {
        throw new Error(
            "useThreadsContext must be used within a ThreadsProvider"
        );
    }
    return context;
}

export const ThreadsProvider: React.FC<ThreadsProviderProps> = ({
    children,
}) => {
    const { toast } = useToaster();
    const { selectedCampaign } = useCampaignContext();
    const { showDebug, refreshUsage } = useUserContext();
    const apolloClient = useApolloClient();
    const [storedThreadId, setStoredThreadId] = useSessionStorage<
        string | null
    >("selectedThreadId", null);
    const {
        array: threadList,
        rebase: setThreadList,
        clear: clearThreads,
    } = useMap<string, ThreadDetailsFragment>([]);
    const {
        array: messageList,
        set: setMessageList,
        push: addMessage,
    } = useArray<MessageDetailsFragment>([]);
    const [selectedThread, setSelectedThread] =
        useState<ThreadDetailsFragment | null>(null);

    // Track previous campaign ID to distinguish initial load from campaign switch
    const prevCampaignIdRef = useRef<string | null>(null);

    // Track optimistic message count to prevent stale Apollo data from overwriting
    const optimisticMessageCountRef = useRef<number>(0);

    // Use generation state from signals
    const { isGenerating, generatingContent, canStartGeneration } =
        useGenerationState();

    // Query for active generations (used for reconnection on mount)
    const [getActiveGenerations] = useGetActiveGenerationsLazyQuery({
        fetchPolicy: "network-only",
    });

    // Callbacks for generation events - memoized to avoid recreating on every render
    const onAssetModified = useCallback(
        (assetType: string, assetId: string) => {
            // Notify open modals that their asset was modified externally
            // The modal will auto-refresh if clean, or show a warning if dirty
            notifyAssetStale(assetId);

            // Refetch the ListCampaignAssets query to update the asset menu sidebar
            apolloClient.refetchQueries({
                include: "active",
                onQueryUpdated: (observableQuery) => {
                    if (observableQuery.queryName === "ListCampaignAssets") {
                        const variables =
                            observableQuery.variables as ListCampaignAssetsQueryVariables;
                        // Need to perform a case-insensitive check because recordType is an enum (e.g. "NPC")
                        // but assetType from regex might be mixed case depending on match
                        return (
                            variables?.input?.recordType?.toLowerCase() ===
                            assetType.toLowerCase()
                        );
                    }
                    return false;
                },
            });
        },
        [apolloClient]
    );

    const onGenerationError = useCallback(
        (error: Error) => {
            toast.danger({
                title: "Generation Error",
                message: error.message || "Failed to generate message",
                duration: 5000,
            });
            Sentry.captureException(error, {
                extra: {
                    selectedThreadId: selectedThread?.id,
                    selectedCampaignId: selectedCampaign?.id,
                    reminder:
                        "This error occurred while a response was being generated by the AI. Check the error details on the server to see what went wrong.",
                },
            });
        },
        [selectedThread?.id, selectedCampaign?.id, toast]
    );

    const variables = useMemo<GetThreadByIdQueryVariables>(() => {
        return {
            getThreadInput: {
                threadId: selectedThread ? selectedThread.id : "",
            },
        };
    }, [selectedThread]);
    const [getMyThreads, { loading }] = useGetMyThreadsLazyQuery({
        fetchPolicy: "network-only",
    });
    const { data: selectedThreadData, loading: loadingSelectedThread } =
        useGetThreadByIdQuery({
            variables,
            skip: !selectedThread,
            fetchPolicy: "network-only",
        });
    const [createMessage] = useCreateMessageMutation();
    const [updateThread] = useUpdateThreadMutation();

    // Fetches the messages for the currently selected thread
    useEffect(() => {
        if (loadingSelectedThread) return;

        // If no thread is selected, clear messages
        if (!selectedThread) {
            optimisticMessageCountRef.current = 0;
            setMessageList([]);
            return;
        }

        const currThreadMessages =
            selectedThreadData?.getThread?.thread?.messages;
        // Only update messages when we have data - don't clear during refetches
        // Message clearing on thread switch is handled explicitly in selectThread
        if (currThreadMessages) {
            // Don't overwrite if we have optimistic messages that Apollo doesn't know about yet
            if (
                currThreadMessages.length >= optimisticMessageCountRef.current
            ) {
                setMessageList(currThreadMessages);
                optimisticMessageCountRef.current = currThreadMessages.length;
            }
        }
    }, [
        selectedThread,
        selectedThreadData,
        loadingSelectedThread,
        setMessageList,
    ]);

    const selectThread = useCallback(
        (threadId: string | null) => {
            // Skip if selecting the same thread that's already selected
            if (threadId === selectedThread?.id) {
                return;
            }

            // Clear messages immediately to prevent showing old messages
            setMessageList([]);
            optimisticMessageCountRef.current = 0;

            // Update the selected thread signal for generation notifications
            selectedThreadIdSignal.value = threadId;

            if (!threadId) {
                setSelectedThread(null);
                setStoredThreadId(null);
                return;
            }
            const thread = threadList.find((t) => t.id === threadId);
            if (!thread) {
                return;
            }
            setSelectedThread(thread);
            setStoredThreadId(threadId);
        },
        [threadList, setStoredThreadId, setMessageList, selectedThread?.id]
    );

    const refreshThreads = useCallback(async (): Promise<
        Map<string, ThreadDetailsFragment>
    > => {
        try {
            const { data } = await getMyThreads();

            if (!data?.threads) {
                clearThreads();
                return new Map();
            }

            const threadMap = new Map<string, ThreadDetailsFragment>(
                data.threads.map((t) => [t.id, t])
            );

            setThreadList(threadMap);
            return threadMap;
        } catch (_error) {
            toast.danger({
                title: "Error Refreshing Threads",
                message: "Failed to refresh thread list.",
                duration: 5000,
            });
            return new Map();
        }
    }, [getMyThreads, clearThreads, setThreadList, toast]);

    const togglePinThread = useCallback(
        async (threadId: string, pin: boolean) => {
            try {
                await updateThread({
                    variables: { input: { threadId, isPinned: pin } },
                });
                // Refresh threads to get updated pin status
                await refreshThreads();
            } catch (error) {
                toast.danger({
                    title: "Error Updating Thread",
                    message: "Failed to update thread pin status.",
                    duration: 5000,
                });
                Sentry.logger.error(
                    "Failure when updating thread pin status.",
                    {
                        error,
                    }
                );
            }
        },
        [updateThread, refreshThreads, toast]
    );

    useEffect(() => {
        return () => {
            generationManager.clearAll();
        };
    }, []);

    useEffect(() => {
        // Add a listener for CustomEvent "select-thread" to allow external components to select a thread by dispatching an event with detail { threadId: string }
        const handleSelectThreadEvent = (event: Event) => {
            const customEvent = event as CustomEvent<{ threadId: string }>;
            const threadId = customEvent.detail.threadId;
            selectThread(threadId);
        };
        window.addEventListener("select-thread", handleSelectThreadEvent);
        return () => {
            window.removeEventListener(
                "select-thread",
                handleSelectThreadEvent
            );
        };
    }, [selectThread]);

    // Refresh threads when campaign changes, clear generations, then reconnect
    // biome-ignore lint/correctness/useExhaustiveDependencies: This effect should only run when selectedCampaign.id changes
    useEffect(() => {
        const campaignId = selectedCampaign?.id;
        if (!campaignId) {
            return;
        }

        // Check if this is initial load or a campaign switch
        const isInitialLoad = prevCampaignIdRef.current === null;
        const isCampaignSwitch =
            prevCampaignIdRef.current !== null &&
            prevCampaignIdRef.current !== campaignId;

        // Update the ref for next time
        prevCampaignIdRef.current = campaignId;

        let mounted = true;

        const initializeCampaign = async () => {
            // Clear all generations from previous campaign
            generationManager.clearAll();

            // Only clear thread selection on campaign SWITCH, not initial load
            if (isCampaignSwitch) {
                clearThreads();
                setSelectedThread(null);
                setStoredThreadId(null);
                selectedThreadIdSignal.value = null;
            }

            // Refresh threads for the campaign
            const threadMap = await refreshThreads();
            if (!mounted) return;

            // On initial load, restore previously selected thread from session storage
            if (isInitialLoad && storedThreadId) {
                const thread = threadMap.get(storedThreadId);
                if (thread) {
                    setSelectedThread(thread);
                    selectedThreadIdSignal.value = storedThreadId;
                } else {
                    setStoredThreadId(null);
                }
            }

            // Reconnect to any active generations for this campaign
            try {
                const { data: genData } = await getActiveGenerations();
                if (!mounted || !genData?.activeGenerations?.length) return;

                generationManager.reconnectAll(
                    genData.activeGenerations,
                    {
                        onComplete: (message, completedThreadId) => {
                            // Add AI message if the completed thread is currently selected
                            if (
                                selectedThreadIdSignal.value ===
                                completedThreadId
                            ) {
                                optimisticMessageCountRef.current += 1;
                                addMessage(message);
                            }
                            // If different thread, message will be fetched when thread is selected
                            refreshUsage();
                        },
                        onError: onGenerationError,
                        onAssetModified,
                    },
                    { showDebug }
                );
            } catch (error) {
                console.error(
                    "Error reconnecting to active generations:",
                    error
                );
            }
        };

        initializeCampaign();

        return () => {
            mounted = false;
        };
    }, [selectedCampaign?.id, setStoredThreadId, clearThreads]);

    // Abort the current thread's generation
    const abortCurrentGeneration = useCallback(async () => {
        const threadId = selectedThread?.id;
        if (!threadId) return;

        const success = await generationManager.abortGeneration(threadId);
        if (!success) {
            toast.warning({
                title: "Abort Failed",
                message:
                    "Could not abort the generation. It may have already completed.",
                duration: 3000,
            });
        }
    }, [selectedThread?.id, toast]);

    const sendMessage = useCallback(
        async (content: string) => {
            // Step 1: Check concurrent limit BEFORE making mutation
            if (!generationManager.canStartGeneration()) {
                toast.warning({
                    title: "Generation Limit Reached",
                    message:
                        "Maximum 3 concurrent generations. Please wait for one to complete.",
                    duration: 5000,
                });
                return;
            }

            try {
                LogEvent("send_message");
                // Step 2: Create the message (and thread if needed)
                const response = await createMessage({
                    variables: {
                        createMessageInput: {
                            threadId: selectedThread?.id,
                            content,
                        },
                    },
                });

                const newMessage = response.data?.createMessage?.message;
                if (!newMessage) {
                    throw new Error("No message returned.");
                }
                const { threadId, ...messageFragment } = newMessage;

                // Step 3: Handle new thread case - MUST happen before starting generation
                const isNewThread = !selectedThread?.id;
                let threadTitle = selectedThread?.title || "New Chat";

                if (isNewThread) {
                    // Refresh thread list to get the new thread
                    const threadMap = await refreshThreads();
                    const thread = threadMap.get(threadId);
                    if (thread) {
                        threadTitle = thread.title;
                        setSelectedThread(thread);
                        setStoredThreadId(threadId);
                        // Update selectedThreadId signal for notifications
                        selectedThreadIdSignal.value = threadId;
                    }
                    LogEvent("create_thread");
                }

                // Step 4: Add user message to list (optimistic update)
                optimisticMessageCountRef.current += 1;
                addMessage(messageFragment);
                // Note: We don't refetch messages here because we're adding them optimistically
                // The AI message will be added via onComplete callback

                // Step 5: NOW start generation - we have the threadId
                generationManager.startGeneration(
                    threadId,
                    threadTitle,
                    {
                        onComplete: (message, completedThreadId) => {
                            // Add AI message to the correct thread if it's selected
                            if (
                                selectedThreadIdSignal.value ===
                                completedThreadId
                            ) {
                                optimisticMessageCountRef.current += 1;
                                addMessage(message);
                            }
                            // If different thread, message will be fetched when thread is selected
                            refreshUsage();
                            // Refresh thread list to update ordering in the menu
                            refreshThreads();
                        },
                        onError: onGenerationError,
                        onAssetModified,
                    },
                    { showDebug }
                );
            } catch (error) {
                toast.danger({
                    title: "Message Creation Error",
                    message:
                        "There was an error creating the message, please check your connection and try again.",
                    duration: 5000,
                });
                Sentry.logger.error("Failure when sending a message.", {
                    error,
                });
            }
        },
        [
            selectedThread,
            toast,
            addMessage,
            refreshThreads,
            setStoredThreadId,
            createMessage,
            onGenerationError,
            onAssetModified,
            showDebug,
            refreshUsage,
        ]
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies: messageList is intentionally excluded to prevent infinite re-renders. Consumers get updates via the array reference.
    const threadsContextPayload = useMemo<ThreadsContextPayload>(
        () => ({
            threadList,
            loading,
            selectThread,
            selectedThread,
            selectedThreadId: selectedThread?.id ?? "",
            messageList,
            sendMessage,
            isGenerating,
            generatingContent,
            canStartGeneration,
            abortCurrentGeneration,
            refreshThreads,
            togglePinThread,
        }),
        [
            threadList,
            loading,
            selectThread,
            selectedThread,
            canStartGeneration,
            abortCurrentGeneration,
            sendMessage,
            messageList.length,
            isGenerating,
            generatingContent,
            refreshThreads,
            togglePinThread,
        ]
    );

    return (
        <ThreadsContext.Provider value={threadsContextPayload}>
            {children}
        </ThreadsContext.Provider>
    );
};
