import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { ChatHistoryMenu } from "./ChatHistoryMenu";

// Mock dependencies
const mockSelectThread = vi.fn();
const mockTogglePinThread = vi.fn();
const mockIsThreadGenerating = vi.fn();

vi.mock("@context", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@context")>();
    return {
        ...actual,
        useThreadsContext: vi.fn(),
    };
});

vi.mock("@signals", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@signals")>();
    return {
        ...actual,
        useGenerationState: vi.fn(),
    };
});

// Import mocked modules for access
import { useThreadsContext } from "@context";
import { useGenerationState } from "@signals";

const mockUseThreadsContext = vi.mocked(useThreadsContext);
const mockUseGenerationState = vi.mocked(useGenerationState);

// Helper to create thread objects
const createThread = (
    id: string,
    title: string,
    isPinned = false,
    lastUsed = new Date()
) => ({
    id,
    title,
    isPinned,
    lastUsed,
    campaignId: "campaign-1",
});

// Default mock setup
const setupMocks = (
    threadList: ReturnType<typeof createThread>[] = [],
    selectedThread: ReturnType<typeof createThread> | null = null,
    generatingThreadIds: string[] = []
) => {
    mockUseThreadsContext.mockReturnValue({
        threadList,
        selectThread: mockSelectThread,
        selectedThread,
        togglePinThread: mockTogglePinThread,
        // Minimal required values from context
        selectedThreadId: selectedThread?.id ?? "",
        messageList: [],
        loading: false,
        sendMessage: vi.fn(),
        isGenerating: false,
        generatingContent: "",
        canStartGeneration: true,
        abortCurrentGeneration: vi.fn(),
        refreshThreads: vi.fn(),
    });

    mockIsThreadGenerating.mockImplementation((threadId: string) =>
        generatingThreadIds.includes(threadId)
    );

    mockUseGenerationState.mockReturnValue({
        isThreadGenerating: mockIsThreadGenerating,
        generations: new Map(),
        selectedThreadId: selectedThread?.id ?? null,
        currentGeneration: undefined,
        isGenerating: false,
        generatingContent: "",
        canStartGeneration: true,
        activeCount: generatingThreadIds.length,
        getGeneration: vi.fn(),
    });
};

// Helper to get dropdown toggle button
const getDropdownToggle = () =>
    document.getElementById("chat-history-dropdown") as HTMLButtonElement;

describe("ChatHistoryMenu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe("empty state", () => {
        test("should return null when threadList is empty", () => {
            setupMocks([]);

            const { container } = render(<ChatHistoryMenu />);

            // The component returns null, but test-utils wraps in providers
            // Check there's no dropdown rendered
            expect(container.querySelector(".dropdown")).toBeNull();
        });
    });

    describe("dropdown toggle", () => {
        test("should render dropdown toggle button", () => {
            setupMocks([createThread("1", "Test Thread")]);

            render(<ChatHistoryMenu />);

            expect(getDropdownToggle()).toBeInTheDocument();
        });
    });

    describe("new chat button", () => {
        test.each([
            {
                hasSelectedThread: true,
                threadCount: 1,
                expectedVisible: true,
            },
            {
                hasSelectedThread: false,
                threadCount: 1,
                expectedVisible: false,
            },
        ])(
            "should be visible=$expectedVisible when hasSelectedThread=$hasSelectedThread",
            ({ hasSelectedThread, threadCount, expectedVisible }) => {
                const threads = Array.from({ length: threadCount }, (_, i) =>
                    createThread(`thread-${i}`, `Thread ${i}`)
                );
                const selectedThread = hasSelectedThread ? threads[0] : null;
                setupMocks(threads, selectedThread);

                render(<ChatHistoryMenu />);

                // Open dropdown
                fireEvent.click(getDropdownToggle());

                const newChatButton = screen.queryByText("New Chat");
                if (expectedVisible) {
                    expect(newChatButton).toBeInTheDocument();
                } else {
                    expect(newChatButton).not.toBeInTheDocument();
                }
            }
        );

        test("should call selectThread(null) when New Chat is clicked", () => {
            const thread = createThread("1", "Test Thread");
            setupMocks([thread], thread);

            render(<ChatHistoryMenu />);

            // Open dropdown and click New Chat
            fireEvent.click(getDropdownToggle());
            fireEvent.click(screen.getByText("New Chat"));

            expect(mockSelectThread).toHaveBeenCalledWith(null);
        });
    });

    describe("thread organization", () => {
        test("should show Favorite Threads header for pinned threads", () => {
            const pinnedThread = createThread("1", "Pinned Thread", true);
            setupMocks([pinnedThread]);

            render(<ChatHistoryMenu />);
            fireEvent.click(getDropdownToggle());

            expect(screen.getByText("Favorite Threads")).toBeInTheDocument();
            expect(screen.getByText("Pinned Thread")).toBeInTheDocument();
        });

        test("should show Recent header for unpinned threads", () => {
            const recentThread = createThread("1", "Recent Thread", false);
            setupMocks([recentThread]);

            render(<ChatHistoryMenu />);
            fireEvent.click(getDropdownToggle());

            expect(screen.getByText("Recent")).toBeInTheDocument();
            expect(screen.getByText("Recent Thread")).toBeInTheDocument();
        });

        test("should separate pinned and unpinned threads into correct sections", () => {
            const threads = [
                createThread("1", "Pinned One", true),
                createThread("2", "Unpinned One", false),
                createThread("3", "Pinned Two", true),
            ];
            setupMocks(threads);

            render(<ChatHistoryMenu />);
            fireEvent.click(getDropdownToggle());

            expect(screen.getByText("Favorite Threads")).toBeInTheDocument();
            expect(screen.getByText("Recent")).toBeInTheDocument();
            expect(screen.getByText("Pinned One")).toBeInTheDocument();
            expect(screen.getByText("Pinned Two")).toBeInTheDocument();
            expect(screen.getByText("Unpinned One")).toBeInTheDocument();
        });
    });

    describe("show all / older threads", () => {
        test("should show expand button when there are more than 3 unpinned threads", () => {
            // Create 5 unpinned threads (3 recent + 2 older)
            const threads = Array.from({ length: 5 }, (_, i) =>
                createThread(
                    `thread-${i}`,
                    `Thread ${i}`,
                    false,
                    new Date(Date.now() - i * 60000) // Stagger times
                )
            );
            setupMocks(threads);

            render(<ChatHistoryMenu />);
            fireEvent.click(getDropdownToggle());

            expect(screen.getByText("Show all (2 more)")).toBeInTheDocument();
        });

        test("should toggle to show older threads when clicked", () => {
            const threads = Array.from({ length: 5 }, (_, i) =>
                createThread(
                    `thread-${i}`,
                    `Thread ${i}`,
                    false,
                    new Date(Date.now() - i * 60000)
                )
            );
            setupMocks(threads);

            render(<ChatHistoryMenu />);
            fireEvent.click(getDropdownToggle());

            // Click show all
            fireEvent.click(screen.getByText("Show all (2 more)"));

            // Should now show "Hide older"
            expect(screen.getByText("Hide older (2)")).toBeInTheDocument();
        });

        test("should not show expand button when 3 or fewer unpinned threads", () => {
            const threads = [
                createThread("1", "Thread 1", false),
                createThread("2", "Thread 2", false),
                createThread("3", "Thread 3", false),
            ];
            setupMocks(threads);

            render(<ChatHistoryMenu />);
            fireEvent.click(getDropdownToggle());

            expect(screen.queryByText(/Show all/)).not.toBeInTheDocument();
        });
    });

    describe("thread selection", () => {
        test("should call selectThread when a thread is clicked", () => {
            const thread = createThread("thread-123", "My Thread");
            setupMocks([thread]);

            render(<ChatHistoryMenu />);
            fireEvent.click(getDropdownToggle());
            fireEvent.click(screen.getByText("My Thread"));

            expect(mockSelectThread).toHaveBeenCalledWith("thread-123");
        });

        test("should show selected thread title in header", () => {
            const thread = createThread("1", "Selected Thread Title");
            setupMocks([thread], thread);

            render(<ChatHistoryMenu />);
            fireEvent.click(getDropdownToggle());

            // The title appears in both header (as dropdown-header) and thread item
            // Check specifically for the header element
            const header = screen.getByRole("heading", {
                name: "Selected Thread Title",
            });
            expect(header).toBeInTheDocument();
            expect(header).toHaveClass("dropdown-header");
        });
    });

    describe("pin toggle", () => {
        test("should call togglePinThread with correct arguments", () => {
            const thread = createThread("thread-1", "Test Thread", false);
            setupMocks([thread]);

            render(<ChatHistoryMenu />);
            fireEvent.click(getDropdownToggle());

            // Find and click the pin button
            const pinButton = screen.getByRole("button", {
                name: "Favorite thread",
            });
            fireEvent.click(pinButton);

            expect(mockTogglePinThread).toHaveBeenCalledWith("thread-1", true);
        });
    });

    describe("generation indicator", () => {
        test("should pass isGenerating=true to thread item when thread is generating", () => {
            const thread = createThread("gen-thread", "Generating Thread");
            setupMocks([thread], null, ["gen-thread"]);

            render(<ChatHistoryMenu />);
            fireEvent.click(getDropdownToggle());

            // Check that isThreadGenerating was called with the thread id
            expect(mockIsThreadGenerating).toHaveBeenCalledWith("gen-thread");
        });

        test("should show spinner on generating threads", () => {
            const thread = createThread("gen-thread", "Generating Thread");
            setupMocks([thread], null, ["gen-thread"]);

            render(<ChatHistoryMenu />);
            fireEvent.click(getDropdownToggle());

            // The HistoryThreadItem renders a spinner with title "Generating..."
            expect(screen.getByTitle("Generating...")).toBeInTheDocument();
        });
    });
});
