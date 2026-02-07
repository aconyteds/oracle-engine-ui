import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ThreadsProvider, useThreadsContext } from "./Threads.context";

// Track thread array for tests
let mockThreadArray: { id: string; title: string }[];

// Mock Apollo Client
vi.mock("@apollo/client", () => ({
    useApolloClient: vi.fn(() => ({
        refetchQueries: vi.fn(),
    })),
}));

// Mock GraphQL hooks
vi.mock("@graphql", () => ({
    useGetMyThreadsLazyQuery: vi.fn(() => [
        vi.fn().mockResolvedValue({ data: { threads: [] } }),
        { loading: false },
    ]),
    useGetThreadByIdQuery: vi.fn(() => ({
        data: null,
        loading: false,
    })),
    useCreateMessageMutation: vi.fn(() => [vi.fn()]),
    useUpdateThreadMutation: vi.fn(() => [vi.fn()]),
    useGetActiveGenerationsLazyQuery: vi.fn(() => [
        vi.fn().mockResolvedValue({ data: { activeGenerations: [] } }),
        { loading: false },
    ]),
}));

// Mock Campaign context
vi.mock("./Campaign.context", () => ({
    useCampaignContext: vi.fn(() => ({
        selectedCampaign: { id: "campaign-1" },
    })),
}));

// Mock User context
vi.mock("./User.context", () => ({
    useUserContext: vi.fn(() => ({
        showDebug: false,
        refreshUsage: vi.fn(),
    })),
}));

// Mock Toaster context
vi.mock("./Toaster.context", () => ({
    useToaster: vi.fn(() => ({
        toast: {
            success: vi.fn(),
            danger: vi.fn(),
            warning: vi.fn(),
            info: vi.fn(),
        },
    })),
}));

// Mock signals
vi.mock("@signals", () => ({
    generationManager: {
        clearAll: vi.fn(),
        canStartGeneration: vi.fn(() => true),
        startGeneration: vi.fn(),
        abortGeneration: vi.fn(),
        reconnectAll: vi.fn(),
    },
    notifyAssetStale: vi.fn(),
    selectedThreadIdSignal: { value: null },
    useGenerationState: vi.fn(() => ({
        isGenerating: false,
        generatingContent: "",
        canStartGeneration: true,
    })),
}));

// Mock Firebase
vi.mock("../components/firebase", () => ({
    LogEvent: vi.fn(),
}));

// Mock Sentry
vi.mock("@sentry/react", () => ({
    captureException: vi.fn(),
    logger: { error: vi.fn() },
}));

// Mock hooks - use getter for threadArray so tests can modify it
vi.mock("@hooks", () => ({
    useSessionStorage: vi.fn(() => [null, vi.fn()]),
    useArray: vi.fn(() => ({
        array: [],
        set: vi.fn(),
        push: vi.fn(),
        filter: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
    })),
    useMap: vi.fn(() => ({
        get array() {
            return mockThreadArray;
        },
        rebase: vi.fn(),
        clear: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
    })),
}));

describe("ThreadsContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        mockThreadArray = [];
    });

    afterEach(() => {
        cleanup();
    });

    describe("context initialization", () => {
        test("should throw error when useThreadsContext is used outside provider", () => {
            const consoleError = console.error;
            console.error = vi.fn();

            expect(() => renderHook(() => useThreadsContext())).toThrow(
                "useThreadsContext must be used within a ThreadsProvider"
            );

            console.error = consoleError;
        });

        test("should provide all expected context values", () => {
            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <ThreadsProvider>{children}</ThreadsProvider>
            );

            const { result } = renderHook(() => useThreadsContext(), {
                wrapper,
            });

            expect(result.current).toHaveProperty("threadList");
            expect(result.current).toHaveProperty("loading");
            expect(result.current).toHaveProperty("selectThread");
            expect(result.current).toHaveProperty("selectedThread");
            expect(result.current).toHaveProperty("selectedThreadId");
            expect(result.current).toHaveProperty("messageList");
            expect(result.current).toHaveProperty("sendMessage");
            expect(result.current).toHaveProperty("isGenerating");
            expect(result.current).toHaveProperty("generatingContent");
            expect(result.current).toHaveProperty("canStartGeneration");
            expect(result.current).toHaveProperty("abortCurrentGeneration");
            expect(result.current).toHaveProperty("refreshThreads");
            expect(result.current).toHaveProperty("togglePinThread");
        });

        test("should have correct initial state", () => {
            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <ThreadsProvider>{children}</ThreadsProvider>
            );

            const { result } = renderHook(() => useThreadsContext(), {
                wrapper,
            });

            expect(result.current.selectedThread).toBeNull();
            expect(result.current.selectedThreadId).toBe("");
            expect(result.current.isGenerating).toBe(false);
            expect(result.current.generatingContent).toBe("");
            expect(result.current.canStartGeneration).toBe(true);
        });

        test("should have all required functions", () => {
            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <ThreadsProvider>{children}</ThreadsProvider>
            );

            const { result } = renderHook(() => useThreadsContext(), {
                wrapper,
            });

            expect(typeof result.current.selectThread).toBe("function");
            expect(typeof result.current.sendMessage).toBe("function");
            expect(typeof result.current.abortCurrentGeneration).toBe(
                "function"
            );
            expect(typeof result.current.refreshThreads).toBe("function");
            expect(typeof result.current.togglePinThread).toBe("function");
        });
    });

    describe("generation state integration", () => {
        test("should reflect generation state from signals hook", () => {
            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <ThreadsProvider>{children}</ThreadsProvider>
            );

            const { result } = renderHook(() => useThreadsContext(), {
                wrapper,
            });

            expect(result.current.isGenerating).toBe(false);
            expect(result.current.generatingContent).toBe("");
            expect(result.current.canStartGeneration).toBe(true);
        });
    });

    describe("thread selection", () => {
        test("should not select non-existent thread", () => {
            mockThreadArray = [{ id: "thread-1", title: "Thread 1" }];

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <ThreadsProvider>{children}</ThreadsProvider>
            );

            const { result } = renderHook(() => useThreadsContext(), {
                wrapper,
            });

            act(() => {
                result.current.selectThread("non-existent");
            });

            expect(result.current.selectedThread).toBeNull();
            expect(result.current.selectedThreadId).toBe("");
        });

        test("should update selectedThread when valid thread is selected", () => {
            const thread = { id: "thread-1", title: "Thread 1" };
            mockThreadArray = [thread];

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <ThreadsProvider>{children}</ThreadsProvider>
            );

            const { result } = renderHook(() => useThreadsContext(), {
                wrapper,
            });

            act(() => {
                result.current.selectThread("thread-1");
            });

            expect(result.current.selectedThread).toEqual(thread);
            expect(result.current.selectedThreadId).toBe("thread-1");
        });

        test("should clear selectedThread when null is passed", () => {
            const thread = { id: "thread-1", title: "Thread 1" };
            mockThreadArray = [thread];

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <ThreadsProvider>{children}</ThreadsProvider>
            );

            const { result } = renderHook(() => useThreadsContext(), {
                wrapper,
            });

            act(() => {
                result.current.selectThread("thread-1");
            });

            expect(result.current.selectedThread).toEqual(thread);

            act(() => {
                result.current.selectThread(null);
            });

            expect(result.current.selectedThread).toBeNull();
            expect(result.current.selectedThreadId).toBe("");
        });

        test("should not change state when selecting same thread", () => {
            const thread = { id: "thread-1", title: "Thread 1" };
            mockThreadArray = [thread];

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <ThreadsProvider>{children}</ThreadsProvider>
            );

            const { result } = renderHook(() => useThreadsContext(), {
                wrapper,
            });

            act(() => {
                result.current.selectThread("thread-1");
            });

            const selectedThreadRef = result.current.selectedThread;

            act(() => {
                result.current.selectThread("thread-1");
            });

            // Same reference means state wasn't changed
            expect(result.current.selectedThread).toBe(selectedThreadRef);
        });

        test("should switch between threads", () => {
            const thread1 = { id: "thread-1", title: "Thread 1" };
            const thread2 = { id: "thread-2", title: "Thread 2" };
            mockThreadArray = [thread1, thread2];

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <ThreadsProvider>{children}</ThreadsProvider>
            );

            const { result } = renderHook(() => useThreadsContext(), {
                wrapper,
            });

            act(() => {
                result.current.selectThread("thread-1");
            });

            expect(result.current.selectedThread).toEqual(thread1);

            act(() => {
                result.current.selectThread("thread-2");
            });

            expect(result.current.selectedThread).toEqual(thread2);
            expect(result.current.selectedThreadId).toBe("thread-2");
        });
    });
});
