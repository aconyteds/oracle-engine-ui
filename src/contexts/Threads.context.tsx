import {
    GetThreadByIdQueryVariables,
    MessageDetailsFragment,
    ThreadDetailsFragment,
    useGetMyThreadsQuery,
    useGetThreadByIdQuery,
    useCreateMessageMutation,
} from "@graphql";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    useRef,
} from "react";
import { useArray, useMap, useLocalStorage } from "@hooks";
import { useToaster } from "./Toaster.context";

export type ThreadDetails = ThreadDetailsFragment & {
    generating: boolean;
};

type ThreadsContextPayload = {
    threadList: ThreadDetails[];
    loading: boolean;
    selectThread: (threadId: string | null) => void;
    selectedThread: ThreadDetails | null;
    selectedThreadId: string;
    messageList: MessageDetailsFragment[];
    sendMessage: (content: string) => Promise<void>;
    generating: boolean;
    setGenerating: (generating: boolean) => void;
    addMessage: (message: MessageDetailsFragment) => void;
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
    const newThreadRef = useRef<string | null>(null);
    const { toast } = useToaster();
    const [storedThreadId, setStoredThreadId] = useLocalStorage<string | null>(
        "selectedThreadId",
        null
    );
    const {
        array: threadList,
        rebase: setThreadList,
        getItem: getThread,
        clear: clearThreads,
    } = useMap<string, ThreadDetails>([]);
    const {
        array: messageList,
        set: setMessageList,
        push: addMessage,
    } = useArray<MessageDetailsFragment>([]);
    const [selectedThread, setSelectedThread] = useState<ThreadDetails | null>(
        null
    );

    const variables = useMemo<GetThreadByIdQueryVariables>(() => {
        return {
            getThreadInput: {
                threadId: selectedThread ? selectedThread.id : "",
            },
        };
    }, [selectedThread]);
    const { data, loading, refetch } = useGetMyThreadsQuery({
        fetchPolicy: "network-only",
    });
    const { data: selectedThreadData, loading: loadingSelectedThread } =
        useGetThreadByIdQuery({
            variables,
            skip: !selectedThread,
            fetchPolicy: "network-only",
        });
    const [createMessage] = useCreateMessageMutation();

    // Helper: Update the generating flag on a thread in our map and update the selectedThread if needed.
    const updateThreadGenerating = useCallback(
        (threadId: string, generating: boolean) => {
            const thread = getThread(threadId);
            if (!thread) return;
            const updatedThread = { ...thread, generating };
            // Rebuild the map using the current threadList array.
            const newMap = new Map(
                threadList.map((t) => [
                    t.id,
                    t.id === threadId ? updatedThread : t,
                ])
            );
            setThreadList(newMap);
            // If the updated thread is the one selected, update selectedThread with the new version.
            if (selectedThread?.id === threadId) {
                setSelectedThread(updatedThread);
            }
        },
        [threadList, selectedThread]
    );

    // In the ThreadsProvider component, add the setGenerating callback before the context payload
    const setGenerating = useCallback(
        (generating: boolean) => {
            if (!selectedThread) return;
            updateThreadGenerating(selectedThread.id, generating);
            setStoredThreadId(selectedThread.id);
        },
        [selectedThread, updateThreadGenerating]
    );

    const selectThread = useCallback(
        (threadId: string | null) => {
            if (threadList.length === 0) {
                return;
            }
            if (!threadId) {
                setSelectedThread(null);
                setStoredThreadId(null);
                return;
            }
            const thread = getThread(threadId);
            if (!thread) {
                // Clear stored thread if it no longer exists
                setSelectedThread(null);
                setStoredThreadId(null);
                return;
            }
            setSelectedThread(thread);
            setStoredThreadId(threadId);
        },
        [threadList, getThread, setStoredThreadId]
    );

    // Used to initialize the threadList with the data from the query
    // Only should fire after a refetch, or on the initial load
    useEffect(() => {
        if (loading) return;

        if (!data?.threads) {
            clearThreads();
            return;
        }

        // Initialize all threads with generating: false
        setThreadList(
            new Map(
                data.threads.map((t) => [t.id, { ...t, generating: false }])
            )
        );
    }, [data, loading]);

    useEffect(() => {
        if (loading || !threadList.length) return;
        let threadId = storedThreadId;
        if (!newThreadRef.current) {
            if (!threadId) {
                selectThread(null);
                return;
            }
            // Check if the stored thread still exists in the list
            const threadExists = threadList.some(
                (thread) => thread.id === threadId
            );

            selectThread(threadExists ? storedThreadId : null);
            return;
        }
        threadId = newThreadRef.current;
        const thread = getThread(threadId);
        if (!thread) {
            // WE BUSY, thread not loaded yet.
            return;
        }
        newThreadRef.current = null; // clear it, ready to generate
        selectThread(threadId);
        updateThreadGenerating(threadId, true);
    }, [loading, threadList, storedThreadId, selectThread]);

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

    const sendMessage = useCallback(
        async (content: string) => {
            const response = await createMessage({
                variables: {
                    createMessageInput: {
                        threadId: selectedThread?.id,
                        content,
                    },
                },
            });
            if (!response.data?.createMessage?.message) {
                toast.danger({
                    title: "Message Creation Error",
                    message:
                        "There was an error creating the message, please check your connection and try again.",
                    duration: 5000,
                });
                return;
            }
            const { threadId, ...messageFragment } =
                response.data?.createMessage?.message;
            if (!threadId) {
                toast.danger({
                    title: "Thread Creation Error",
                    message:
                        "There was an error creating the thread, we will not be able to have a conversation. Please check your connection and try again.",
                    duration: 5000,
                });
                return;
            }

            if (!selectedThread) {
                // Store the thread ID to be selected after refetch
                newThreadRef.current = threadId;
                // Refresh the thread list for the newest thread
                await refetch();
            } else {
                // For existing threads, update immediately
                addMessage(messageFragment);
                updateThreadGenerating(threadId, true);
            }
        },
        [
            selectedThread,
            createMessage,
            toast,
            addMessage,
            updateThreadGenerating,
            refetch,
        ]
    );

    const threadsContextPayload = useMemo<ThreadsContextPayload>(
        () => ({
            threadList,
            loading,
            selectThread,
            selectedThread,
            selectedThreadId: selectedThread?.id ?? "",
            messageList,
            sendMessage,
            // deriving generating from the selected thread’s flag
            generating: selectedThread?.generating ?? false,
            setGenerating,
            addMessage,
        }),
        [
            threadList,
            loading,
            selectThread,
            selectedThread,
            messageList,
            sendMessage,
            setGenerating,
            addMessage,
        ]
    );

    return (
        <ThreadsContext.Provider value={threadsContextPayload}>
            {children}
        </ThreadsContext.Provider>
    );
};
