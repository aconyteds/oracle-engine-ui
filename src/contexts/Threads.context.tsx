import {
    GetThreadByIdQueryVariables,
    MessageDetailsFragment,
    ThreadDetailsFragment,
    useGetThreadByIdQuery,
    useCreateMessageMutation,
    useGetMyThreadsLazyQuery,
} from "@graphql";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
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
        setItem: setThread,
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
    const [getMyThreads, { loading }] = useGetMyThreadsLazyQuery({
        fetchPolicy: "network-only",
    });
    const {
        data: selectedThreadData,
        loading: loadingSelectedThread,
        refetch: refetchThreadMessages,
    } = useGetThreadByIdQuery({
        variables,
        skip: !selectedThread,
        fetchPolicy: "network-only",
    });
    const [createMessage] = useCreateMessageMutation();

    const processThreadData = useCallback(
        async (threadId?: string): Promise<Map<string, ThreadDetails>> => {
            const { data } = await getMyThreads();

            if (!data?.threads) {
                clearThreads();
                return new Map();
            }

            const threadMap = new Map<string, ThreadDetails>(
                data.threads.map((t) => [
                    t.id,
                    { ...t, generating: t.id === threadId },
                ])
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
        [getMyThreads]
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
    }, []);

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
    }, [selectedThreadData, loadingSelectedThread]);

    // Helper: Update the generating flag on a thread in our map and update the selectedThread if needed.
    const updateThreadGenerating = useCallback(
        (threadId: string, generating: boolean) => {
            const thread = getThread(threadId);
            if (!thread) return;
            const updatedThread = { ...thread, generating };
            setThread(threadId, updatedThread);
            // If the updated thread is the one selected, update selectedThread with the new version.

            if (
                JSON.stringify(selectedThread) !== JSON.stringify(updatedThread)
            ) {
                setSelectedThread(updatedThread);
            }
        },
        [getThread, setThread, selectedThread]
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
                return;
            }
            setSelectedThread(thread);
            setStoredThreadId(threadId);
        },
        [threadList, getThread, setStoredThreadId]
    );

    const sendMessage = useCallback(
        async (content: string) => {
            try {
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

                await processThreadData(threadId);
                if (!selectedThread) {
                    return;
                }
                addMessage(messageFragment);
                refetchThreadMessages();
            } catch (error) {
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
            updateThreadGenerating,
            processThreadData,
        ]
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
            messageList.length,
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
