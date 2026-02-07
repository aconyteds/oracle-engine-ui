import { GenerationStatus, ResponseType } from "@graphql";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
    generationManager,
    generationsSignal,
    selectedThreadIdSignal,
} from "./generationState";

// Type declaration for test global
declare global {
    var __subscriptionHandlers:
        | {
              next: (data: { data?: unknown }) => void;
              error: (error: Error) => void;
              complete: () => void;
          }
        | undefined;
}

// Mock Apollo Client
vi.mock("../apolloClient", () => ({
    default: {
        subscribe: vi.fn(() => ({
            subscribe: vi.fn((handlers) => {
                // Store handlers for test control
                global.__subscriptionHandlers = handlers;
                return { unsubscribe: vi.fn() };
            }),
        })),
        mutate: vi.fn(() =>
            Promise.resolve({
                data: {
                    abortGeneration: { success: true, message: "Aborted" },
                },
            })
        ),
    },
}));

// Mock showToast
vi.mock("../contexts/Toaster.context", () => ({
    showToast: {
        success: vi.fn(),
        warning: vi.fn(),
        danger: vi.fn(),
        info: vi.fn(),
    },
}));

// Mock Notification API
// biome-ignore lint/suspicious/noExplicitAny: Mock setup requires flexible typing
const mockNotification: any = vi.fn();
vi.stubGlobal("Notification", mockNotification);
Object.defineProperty(mockNotification, "permission", {
    value: "default",
    writable: true,
});
mockNotification.requestPermission = vi.fn(() => Promise.resolve("granted"));

describe("generationManager", () => {
    const mockOnComplete = vi.fn();
    const mockOnError = vi.fn();
    const mockOnAssetModified = vi.fn();

    const defaultCallbacks = {
        onComplete: mockOnComplete,
        onError: mockOnError,
        onAssetModified: mockOnAssetModified,
    };

    beforeEach(() => {
        // Reset signals
        generationsSignal.value = new Map();
        selectedThreadIdSignal.value = null;

        // Reset mocks
        vi.clearAllMocks();
        delete global.__subscriptionHandlers;
    });

    afterEach(() => {
        // Clean up any active generations
        generationManager.clearAll();
    });

    describe("startGeneration", () => {
        test("should create a new generation entry in the signal", () => {
            const result = generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            expect(result).toBe(true);
            expect(generationsSignal.value.has("thread-1")).toBe(true);

            const generation = generationsSignal.value.get("thread-1");
            expect(generation?.threadId).toBe("thread-1");
            expect(generation?.threadTitle).toBe("Test Thread");
            expect(generation?.phase).toBe(GenerationStatus.Pending);
            expect(generation?.content).toBe("");
        });

        test("should return true on success", () => {
            const result = generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            expect(result).toBe(true);
        });

        test("should return false if already generating on same thread", () => {
            generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            const result = generationManager.startGeneration(
                "thread-1",
                "Test Thread 2",
                defaultCallbacks
            );

            expect(result).toBe(false);
        });

        test("should return false if at 3 concurrent limit", () => {
            generationManager.startGeneration(
                "thread-1",
                "Thread 1",
                defaultCallbacks
            );
            generationManager.startGeneration(
                "thread-2",
                "Thread 2",
                defaultCallbacks
            );
            generationManager.startGeneration(
                "thread-3",
                "Thread 3",
                defaultCallbacks
            );

            const result = generationManager.startGeneration(
                "thread-4",
                "Thread 4",
                defaultCallbacks
            );

            expect(result).toBe(false);
            expect(generationsSignal.value.size).toBe(3);
        });

        test("should set phase to 'pending' initially", () => {
            generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            const generation = generationsSignal.value.get("thread-1");
            expect(generation?.phase).toBe(GenerationStatus.Pending);
        });

        test("should store threadTitle for notifications", () => {
            generationManager.startGeneration(
                "thread-1",
                "My Custom Title",
                defaultCallbacks
            );

            const generation = generationsSignal.value.get("thread-1");
            expect(generation?.threadTitle).toBe("My Custom Title");
        });
    });

    describe("appendContent", () => {
        test("should accumulate content with double newlines", () => {
            generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            generationManager.appendContent("thread-1", "First chunk");
            generationManager.appendContent("thread-1", "Second chunk");

            const generation = generationsSignal.value.get("thread-1");
            expect(generation?.content).toBe("First chunk\n\nSecond chunk");
        });

        test("should update phase to 'Running' on first content", () => {
            generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            expect(generationsSignal.value.get("thread-1")?.phase).toBe(
                GenerationStatus.Pending
            );

            generationManager.appendContent("thread-1", "Content");

            expect(generationsSignal.value.get("thread-1")?.phase).toBe(
                GenerationStatus.Running
            );
        });

        test("should no-op if generation doesn't exist", () => {
            // Should not throw
            expect(() => {
                generationManager.appendContent("nonexistent", "Content");
            }).not.toThrow();
        });
    });

    describe("completeGeneration", () => {
        test("should call completion callback with message and threadId", () => {
            generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            const mockMessage = { id: "msg-1", content: "Test", role: "AI" };
            // @ts-ignore - simplified for test
            generationManager.completeGeneration("thread-1", mockMessage);

            expect(mockOnComplete).toHaveBeenCalledWith(
                mockMessage,
                "thread-1"
            );
        });

        test("should remove from map after completion", () => {
            generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            const mockMessage = { id: "msg-1", content: "Test", role: "AI" };
            // @ts-ignore - simplified for test
            generationManager.completeGeneration("thread-1", mockMessage);

            expect(generationsSignal.value.has("thread-1")).toBe(false);
        });

        test("should NOT show notifications if thread is currently selected", async () => {
            const { showToast } = await import("../contexts/Toaster.context");

            selectedThreadIdSignal.value = "thread-1";

            generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            const mockMessage = { id: "msg-1", content: "Test", role: "AI" };
            // @ts-ignore - simplified for test
            generationManager.completeGeneration("thread-1", mockMessage);

            expect(showToast.success).not.toHaveBeenCalled();
        });
    });

    describe("abortGeneration", () => {
        test("should return true on success", async () => {
            generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            const result = await generationManager.abortGeneration("thread-1");

            expect(result).toBe(true);
        });

        test("should remove from map on success", async () => {
            generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            await generationManager.abortGeneration("thread-1");

            expect(generationsSignal.value.has("thread-1")).toBe(false);
        });

        test("should return false if generation doesn't exist", async () => {
            const result =
                await generationManager.abortGeneration("nonexistent");

            expect(result).toBe(false);
        });
    });

    describe("canStartGeneration", () => {
        test("should return true when no active generations", () => {
            expect(generationManager.canStartGeneration()).toBe(true);
        });

        test("should return true when 1-2 active generations", () => {
            generationManager.startGeneration(
                "thread-1",
                "Thread 1",
                defaultCallbacks
            );
            expect(generationManager.canStartGeneration()).toBe(true);

            generationManager.startGeneration(
                "thread-2",
                "Thread 2",
                defaultCallbacks
            );
            expect(generationManager.canStartGeneration()).toBe(true);
        });

        test("should return false when 3 active generations", () => {
            generationManager.startGeneration(
                "thread-1",
                "Thread 1",
                defaultCallbacks
            );
            generationManager.startGeneration(
                "thread-2",
                "Thread 2",
                defaultCallbacks
            );
            generationManager.startGeneration(
                "thread-3",
                "Thread 3",
                defaultCallbacks
            );

            expect(generationManager.canStartGeneration()).toBe(false);
        });
    });

    describe("isThreadGenerating", () => {
        test("should return true for generating thread", () => {
            generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            expect(generationManager.isThreadGenerating("thread-1")).toBe(true);
        });

        test("should return false for non-generating thread", () => {
            expect(generationManager.isThreadGenerating("thread-1")).toBe(
                false
            );
        });
    });

    describe("reconnectAll", () => {
        test("should create subscriptions for each active generation", () => {
            const activeGenerations = [
                { threadId: "thread-1", status: GenerationStatus.Running },
                { threadId: "thread-2", status: GenerationStatus.Pending },
            ];

            generationManager.reconnectAll(activeGenerations, defaultCallbacks);

            expect(generationsSignal.value.size).toBe(2);
            expect(generationsSignal.value.has("thread-1")).toBe(true);
            expect(generationsSignal.value.has("thread-2")).toBe(true);
        });

        test("should handle empty activeGenerations array", () => {
            generationManager.reconnectAll([], defaultCallbacks);

            expect(generationsSignal.value.size).toBe(0);
        });

        test("should skip completed/failed/aborted generations", () => {
            const activeGenerations = [
                { threadId: "thread-1", status: GenerationStatus.Completed },
                { threadId: "thread-2", status: GenerationStatus.Failed },
                { threadId: "thread-3", status: GenerationStatus.Aborted },
                { threadId: "thread-4", status: GenerationStatus.Running },
            ];

            generationManager.reconnectAll(activeGenerations, defaultCallbacks);

            expect(generationsSignal.value.size).toBe(1);
            expect(generationsSignal.value.has("thread-4")).toBe(true);
        });
    });

    describe("clearAll", () => {
        test("should clear the generations map", () => {
            generationManager.startGeneration(
                "thread-1",
                "Thread 1",
                defaultCallbacks
            );
            generationManager.startGeneration(
                "thread-2",
                "Thread 2",
                defaultCallbacks
            );

            generationManager.clearAll();

            expect(generationsSignal.value.size).toBe(0);
        });
    });

    describe("setError", () => {
        test("should set phase to 'Failed' and store error", () => {
            generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            const error = new Error("Test error");
            generationManager.setError("thread-1", error);

            const generation = generationsSignal.value.get("thread-1");
            expect(generation?.phase).toBe(GenerationStatus.Failed);
            expect(generation?.error).toBe(error);
        });

        test("should call onError callback", () => {
            generationManager.startGeneration(
                "thread-1",
                "Test Thread",
                defaultCallbacks
            );

            const error = new Error("Test error");
            generationManager.setError("thread-1", error);

            expect(mockOnError).toHaveBeenCalledWith(error);
        });
    });

    describe("getActiveCount", () => {
        test("should return correct count of active generations", () => {
            expect(generationManager.getActiveCount()).toBe(0);

            generationManager.startGeneration(
                "thread-1",
                "Thread 1",
                defaultCallbacks
            );
            expect(generationManager.getActiveCount()).toBe(1);

            generationManager.startGeneration(
                "thread-2",
                "Thread 2",
                defaultCallbacks
            );
            expect(generationManager.getActiveCount()).toBe(2);
        });
    });
});

describe("subscription handling", () => {
    const mockOnComplete = vi.fn();
    const mockOnError = vi.fn();
    const mockOnAssetModified = vi.fn();

    const defaultCallbacks = {
        onComplete: mockOnComplete,
        onError: mockOnError,
        onAssetModified: mockOnAssetModified,
    };

    beforeEach(() => {
        generationsSignal.value = new Map();
        selectedThreadIdSignal.value = null;
        vi.clearAllMocks();
        delete global.__subscriptionHandlers;
    });

    afterEach(() => {
        generationManager.clearAll();
    });

    test("should handle intermediate content response", () => {
        generationManager.startGeneration(
            "thread-1",
            "Test Thread",
            defaultCallbacks
        );

        // Simulate subscription data
        if (global.__subscriptionHandlers) {
            global.__subscriptionHandlers.next({
                data: {
                    generateMessage: {
                        content: "Hello world",
                        responseType: ResponseType.Intermediate,
                        message: null,
                    },
                },
            });
        }

        const generation = generationsSignal.value.get("thread-1");
        expect(generation?.content).toBe("Hello world");
        expect(generation?.phase).toBe(GenerationStatus.Running);
    });

    test("should handle final message response", () => {
        generationManager.startGeneration(
            "thread-1",
            "Test Thread",
            defaultCallbacks
        );

        const mockMessage = { id: "msg-1", content: "Final", role: "AI" };

        // Simulate subscription data with final message
        if (global.__subscriptionHandlers) {
            global.__subscriptionHandlers.next({
                data: {
                    generateMessage: {
                        content: null,
                        responseType: ResponseType.Intermediate,
                        message: mockMessage,
                    },
                },
            });
        }

        expect(mockOnComplete).toHaveBeenCalledWith(mockMessage, "thread-1");
        expect(generationsSignal.value.has("thread-1")).toBe(false);
    });

    test("should handle subscription error", () => {
        generationManager.startGeneration(
            "thread-1",
            "Test Thread",
            defaultCallbacks
        );

        const error = new Error("Subscription error");

        // Simulate subscription error
        if (global.__subscriptionHandlers) {
            global.__subscriptionHandlers.error(error);
        }

        expect(mockOnError).toHaveBeenCalledWith(error);
        const generation = generationsSignal.value.get("thread-1");
        expect(generation?.phase).toBe(GenerationStatus.Failed);
    });

    test("should detect and notify asset modifications", () => {
        generationManager.startGeneration(
            "thread-1",
            "Test Thread",
            defaultCallbacks
        );

        // Simulate content with asset creation pattern
        if (global.__subscriptionHandlers) {
            global.__subscriptionHandlers.next({
                data: {
                    generateMessage: {
                        content: "Created [Gandalf](NPC:npc-123)",
                        responseType: ResponseType.Intermediate,
                        message: null,
                    },
                },
            });
        }

        expect(mockOnAssetModified).toHaveBeenCalledWith("NPC", "npc-123");
    });

    test("should filter out debug messages by default", () => {
        generationManager.startGeneration(
            "thread-1",
            "Test Thread",
            defaultCallbacks
        );

        // Simulate debug message
        if (global.__subscriptionHandlers) {
            global.__subscriptionHandlers.next({
                data: {
                    generateMessage: {
                        content: "Debug info",
                        responseType: ResponseType.Debug,
                        message: null,
                    },
                },
            });
        }

        const generation = generationsSignal.value.get("thread-1");
        expect(generation?.content).toBe("");
    });
});
