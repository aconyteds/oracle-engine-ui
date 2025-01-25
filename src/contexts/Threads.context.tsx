import {
    GetThreadByIdQueryVariables,
    MessageDetailsFragment,
    ThreadDetailsFragment,
    useGetMyThreadsQuery,
    useGetThreadByIdQuery,
    useCreateMessageMutation,
    useGenerateMessageSubscription,
} from "@graphql";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useArray, useMap } from "@hooks";

type ThreadsContextPayload = {
    threadList: ThreadDetailsFragment[];
    loading: boolean;
    selectThread: (threadId: string | null) => void;
    selectedThread: ThreadDetailsFragment | null;
    selectedThreadId: string;
    messageList: MessageDetailsFragment[];
    sendMessage: (content: string) => Promise<void>;
    newMessageContent: string;
    generating: boolean;
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

const generatingThreads = new Set<string>();

export const ThreadsProvider: React.FC<ThreadsProviderProps> = ({
    children,
}) => {
    const {
        array: threadList,
        rebase: setThreadList,
        getItem: getThread,
    } = useMap<string, ThreadDetailsFragment>([]);
    const { array: messageList, set: setMessageList } =
        useArray<MessageDetailsFragment>([]);
    const [selectedThread, setSelectedThread] =
        useState<ThreadDetailsFragment | null>(null);
    const { data, loading } = useGetMyThreadsQuery();
    const variables = useMemo<GetThreadByIdQueryVariables>(() => {
        return {
            getThreadInput: {
                threadId: selectedThread ? selectedThread.id : "",
            },
        };
    }, [selectedThread]);
    const { data: selectedThreadData, loading: loadingSelectedThread } =
        useGetThreadByIdQuery({
            variables,
            skip: !selectedThread,
            fetchPolicy: "network-only",
            notifyOnNetworkStatusChange: true,
        });
    const [createMessage] = useCreateMessageMutation();
    const [generating, setGenerating] = useState(false);
    const [newMessageContent, setNewMessageContent] = useState("");
    useGenerateMessageSubscription({
        variables: {
            generateMessageInput: {
                threadId: selectedThread?.id ?? "",
            },
        },
        skip: !selectedThread || !generatingThreads.has(selectedThread.id),
        onData: ({ data }) => {
            console.log(data);
            const newMessage = data?.data?.generateMessage?.message;
            if (!selectedThread) {
                setGenerating(false);
                return;
            }
            if (!newMessage) {
                generatingThreads.delete(selectedThread.id);
                setGenerating(false);
                return;
            }
            setGenerating(true);
            setNewMessageContent((prev) => {
                if (newMessage.id !== selectedThread.id) return prev;
                return prev + newMessage.content;
            });
        },
        onComplete: () => {
            if (!selectedThread) return;
            generatingThreads.delete(selectedThread.id);
        },
    });

    useEffect(() => {
        if (loading) return;
        // Set the threadList to the data from the query
        if (!data?.threads) {
            setThreadList(new Map());
            return;
        }
        setThreadList(new Map(data.threads.map((t) => [t.id, t])));
    }, [data, loading]);

    const selectThread = useCallback(
        (threadId: string | null) => {
            if (!threadId) {
                setSelectedThread(null);
                return;
            }
            // Set the selected thread
            setSelectedThread(getThread(threadId) ?? null);
        },
        [threadList, getThread]
    );

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

    const sendMessage = useCallback(
        async (content: string) => {
            const response = await createMessage({
                variables: {
                    createMessageInput: {
                        threadId: selectedThread?.id ?? "",
                        content,
                    },
                },
            });
            const threadId = response.data?.createMessage?.message?.threadId;
            if (!threadId) {
                // TODO:: Toast error
                return;
            }
            if (!selectedThread) {
                selectThread(
                    response.data?.createMessage?.message?.threadId ?? null
                );
            }
            generatingThreads.add(threadId);
        },
        [selectedThread]
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
            generating,
            newMessageContent,
        }),
        [
            threadList,
            loading,
            selectThread,
            selectedThread,
            messageList,
            sendMessage,
            generating,
            newMessageContent,
        ]
    );

    return (
        <ThreadsContext.Provider value={threadsContextPayload}>
            {children}
        </ThreadsContext.Provider>
    );
};
