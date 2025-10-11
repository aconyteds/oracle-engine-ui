import {
    GetThreadByIdQueryVariables,
    MessageDetailsFragment,
    ThreadDetailsFragment,
    useCreateMessageMutation,
    useGetMyThreadsLazyQuery,
    useGetThreadByIdQuery,
} from "@graphql";
import {
    useArray,
    useMap,
    useMessageGeneration,
    useSessionStorage,
} from "@hooks";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useToaster } from "./Toaster.context";

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

    // Use the message generation hook
    const { isGenerating, generatingContent, startGeneration, stopGeneration } =
        useMessageGeneration({
            onMessageComplete: (message) => {
                addMessage(message);
            },
            onError: (error) => {
                toast.danger({
                    title: "Generation Error",
                    message: error.message || "Failed to generate message",
                    duration: 5000,
                });
            },
        });

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

    const processThreadData = useCallback(
        async (
            threadId?: string
        ): Promise<Map<string, ThreadDetailsFragment>> => {
            const { data } = await getMyThreads();

            if (!data?.threads) {
                clearThreads();
                return new Map();
            }

            const threadMap = new Map<string, ThreadDetailsFragment>(
                data.threads.map((t) => [t.id, t])
            );

            setThreadList(threadMap);
            if (!threadId) {
                return threadMap;
            }
            // If we have a threadId, we need to update the selected thread
            const thread = threadMap.get(threadId);
            if (!thread) {
                setStoredThreadId(null);
                return threadMap;
            }
            setSelectedThread(thread);
            return threadMap;
        },
        [getMyThreads, clearThreads, setStoredThreadId, setThreadList]
    );

    // Initial load
    useEffect(() => {
        processThreadData().then((threadMap) => {
            if (!storedThreadId) {
                return;
            }
            const thread = threadMap.get(storedThreadId);
            if (!thread) {
                setStoredThreadId(null);
                return;
            }
            setSelectedThread(thread);
        });
    }, [processThreadData, setStoredThreadId, storedThreadId]);

    // Fetches the messages for the currently selected thread
    useEffect(() => {
        if (loadingSelectedThread) return;
        const currThreadMessages =
            selectedThreadData?.getThread?.thread?.messages;
        if (!currThreadMessages) {
            setMessageList([]);
            return;
        }
        setMessageList(currThreadMessages);
    }, [selectedThreadData, loadingSelectedThread, setMessageList]);

    const selectThread = useCallback(
        (threadId: string | null) => {
            if (!threadId) {
                setSelectedThread(null);
                setStoredThreadId(null);
                // Stop generation if switching away
                if (isGenerating) {
                    stopGeneration();
                }
                return;
            }
            const thread = threadList.find((t) => t.id === threadId);
            if (!thread) {
                return;
            }
            setSelectedThread(thread);
            setStoredThreadId(threadId);
        },
        [threadList, setStoredThreadId, isGenerating, stopGeneration]
    );

    const sendMessage = useCallback(
        async (content: string) => {
            try {
                // Step 1: Create the message
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

                // Step 2: Handle thread selection
                const isNewThread = !selectedThread?.id;
                if (isNewThread) {
                    // Step 3: Refresh thread list to get the new thread
                    const threadMap = await processThreadData(threadId);
                    const thread = threadMap.get(threadId);
                    if (!thread) {
                        throw new Error("Thread not found after creation.");
                    }
                    setStoredThreadId(threadId);
                }

                // Step 4: Add user message to list (optimistic update)
                addMessage(messageFragment);
                // Note: We don't refetch messages here because we're adding them optimistically
                // The AI message will be added via onMessageComplete callback

                // Step 5: Start generation (this opens the WS connection)
                startGeneration(threadId);
            } catch (_error) {
                toast.danger({
                    title: "Message Creation Error",
                    message:
                        "There was an error creating the message, please check your connection and try again.",
                    duration: 5000,
                });
            }
        },
        [
            selectedThread,
            createMessage,
            toast,
            addMessage,
            processThreadData,
            setStoredThreadId,
            startGeneration,
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
        }),
        [
            threadList,
            loading,
            selectThread,
            selectedThread,
            sendMessage,
            messageList.length,
            isGenerating,
            generatingContent,
        ]
    );

    return (
        <ThreadsContext.Provider value={threadsContextPayload}>
            {children}
        </ThreadsContext.Provider>
    );
};
