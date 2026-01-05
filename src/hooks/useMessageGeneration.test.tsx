import { ResponseType } from "@graphql";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useMessageGeneration } from "./useMessageGeneration";

// Mock the GraphQL subscription hook, but keep other exports (like ResponseType) intact
vi.mock("@graphql", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@graphql")>();
    return {
        ...actual,
        useGenerateMessageSubscription: vi.fn(),
    };
});

// Type declaration for test global
declare global {
    var __subscriptionCallbacks:
        | {
              onData: (data: {
                  data?: {
                      data?: {
                          generateMessage?: {
                              content?: string;
                              message?: unknown;
                              responseType?: ResponseType;
                          };
                      };
                  };
              }) => void;
              onError: (error: Error) => void;
          }
        | undefined;
}

describe("useMessageGeneration", () => {
    let mockOnMessageComplete: ReturnType<typeof vi.fn>;
    let mockOnError: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        mockOnMessageComplete = vi.fn();
        mockOnError = vi.fn();

        // Get the mocked function
        const { useGenerateMessageSubscription } = await import("@graphql");

        // Default mock implementation
        vi.mocked(useGenerateMessageSubscription).mockImplementation(
            ({ onData, onError }) => {
                // Store callbacks for later use in tests
                // @ts-ignore - Testing global
                global.__subscriptionCallbacks = { onData, onError };
                return {
                    restart: vi.fn(),
                    loading: false,
                    data: undefined,
                    error: undefined,
                    variables: undefined,
                };
            }
        );
    });

    afterEach(() => {
        vi.clearAllMocks();
        delete global.__subscriptionCallbacks;
    });

    test("should initialize with default state", () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        expect(result.current.isGenerating).toBe(false);
        expect(result.current.activeThreadId).toBe(null);
        expect(result.current.generatingContent).toBe("");
    });

    test("should provide startGeneration function", () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        expect(result.current.startGeneration).toBeDefined();
        expect(typeof result.current.startGeneration).toBe("function");
    });

    test("should provide stopGeneration function", () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        expect(result.current.stopGeneration).toBeDefined();
        expect(typeof result.current.stopGeneration).toBe("function");
    });

    test("startGeneration should set isGenerating to true", async () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
        });
    });

    test("startGeneration should set activeThreadId", async () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.activeThreadId).toBe("thread-123");
        });
    });

    test("startGeneration should clear previous content", async () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        // Start first generation
        act(() => {
            result.current.startGeneration("thread-1");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
        });

        // Simulate some content
        if (global.__subscriptionCallbacks) {
            act(() => {
                global.__subscriptionCallbacks?.onData({
                    data: {
                        data: {
                            generateMessage: {
                                content: "old content",
                                responseType: ResponseType.Intermediate,
                            },
                        },
                    },
                });
            });
        }

        // Start new generation - should clear old content
        act(() => {
            result.current.startGeneration("thread-2");
        });

        expect(result.current.generatingContent).toBe("");
        expect(result.current.generatingContentRef.current).toBe("");
    });

    test("stopGeneration should set isGenerating to false", async () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
        });

        act(() => {
            result.current.stopGeneration();
        });

        expect(result.current.isGenerating).toBe(false);
    });

    test("stopGeneration should clear activeThreadId", async () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
        });

        act(() => {
            result.current.stopGeneration();
        });

        expect(result.current.activeThreadId).toBe(null);
    });

    test("stopGeneration should clear content", async () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
        });

        // Simulate content
        if (global.__subscriptionCallbacks) {
            act(() => {
                global.__subscriptionCallbacks?.onData({
                    data: {
                        data: {
                            generateMessage: {
                                content: "test content",
                                responseType: ResponseType.Intermediate,
                            },
                        },
                    },
                });
            });
        }

        act(() => {
            result.current.stopGeneration();
        });

        expect(result.current.generatingContent).toBe("");
    });

    test("should call useGenerateMessageSubscription with variables", async () => {
        const { useGenerateMessageSubscription } = await import("@graphql");

        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        act(() => {
            result.current.startGeneration("thread-456");
        });

        await waitFor(() => {
            expect(useGenerateMessageSubscription).toHaveBeenCalled();
        });
    });

    test("should skip subscription when not generating", async () => {
        const { useGenerateMessageSubscription } = await import("@graphql");

        renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        expect(useGenerateMessageSubscription).toHaveBeenCalledWith(
            expect.objectContaining({
                skip: true,
            })
        );
    });

    test("should enable subscription when generating", async () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
            expect(result.current.activeThreadId).toBe("thread-123");
        });
    });

    test("should stop generating when message is complete", async () => {
        const mockMessage = {
            id: "msg-1",
            content: "Complete",
            role: "assistant",
            createdAt: new Date().toISOString(),
        };

        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
        });

        if (global.__subscriptionCallbacks) {
            act(() => {
                global.__subscriptionCallbacks?.onData({
                    data: {
                        data: {
                            generateMessage: { message: mockMessage },
                        },
                    },
                });
            });
        }

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(false);
            expect(result.current.activeThreadId).toBe(null);
            expect(result.current.generatingContent).toBe("");
        });
        expect(mockOnMessageComplete).toHaveBeenCalledWith(mockMessage);
    });

    test("should call onError callback on subscription error", async () => {
        const mockError = new Error("Subscription failed");

        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
                onError: mockOnError,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
        });

        // Simulate error
        if (global.__subscriptionCallbacks) {
            act(() => {
                global.__subscriptionCallbacks?.onError(mockError);
            });
        }

        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith(mockError);
        });
    });

    test("should reset state on error", async () => {
        const mockError = new Error("Error");

        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
                onError: mockOnError,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
        });

        if (global.__subscriptionCallbacks) {
            act(() => {
                global.__subscriptionCallbacks?.onError(mockError);
            });
        }

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(false);
            expect(result.current.activeThreadId).toBe(null);
            expect(result.current.generatingContent).toBe("");
        });
    });

    test("should handle error without onError callback", async () => {
        const mockError = new Error("Error");

        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
        });

        // Should not throw
        if (global.__subscriptionCallbacks) {
            expect(() => {
                act(() => {
                    global.__subscriptionCallbacks?.onError(mockError);
                });
            }).not.toThrow();
        }
    });

    test("should provide generatingContentRef", () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        expect(result.current.generatingContentRef).toBeDefined();
        expect(result.current.generatingContentRef.current).toBe("");
    });

    test("should accumulate intermediate content", async () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
        });

        // First chunk
        act(() => {
            global.__subscriptionCallbacks?.onData({
                data: {
                    data: {
                        generateMessage: {
                            content: "Hello",
                            responseType: ResponseType.Intermediate,
                        },
                    },
                },
            });
        });

        await waitFor(() => {
            expect(result.current.generatingContent).toBe("\n\nHello");
        });
        expect(result.current.generatingContentRef.current).toBe("\n\nHello");

        // Second chunk
        act(() => {
            global.__subscriptionCallbacks?.onData({
                data: {
                    data: {
                        generateMessage: {
                            content: " world",
                            responseType: ResponseType.Intermediate,
                        },
                    },
                },
            });
        });

        await waitFor(() => {
            expect(result.current.generatingContent).toBe(
                "\n\nHello\n\n world"
            );
        });
        expect(result.current.generatingContentRef.current).toBe(
            "\n\nHello\n\n world"
        );
    });

    test("should filter out unknown response types by default", async () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
        });

        act(() => {
            global.__subscriptionCallbacks?.onData({
                data: {
                    data: {
                        generateMessage: {
                            content: "Debug Info",
                            responseType: ResponseType.Debug,
                        },
                    },
                },
            });
        });

        expect(result.current.generatingContent).toBe("");
    });

    test("should show debug and reasoning when showDebug is true", async () => {
        const { result } = renderHook(() =>
            useMessageGeneration({
                onMessageComplete: mockOnMessageComplete,
                showDebug: true,
            })
        );

        act(() => {
            result.current.startGeneration("thread-123");
        });

        await waitFor(() => {
            expect(result.current.isGenerating).toBe(true);
        });

        // Debug content
        act(() => {
            global.__subscriptionCallbacks?.onData({
                data: {
                    data: {
                        generateMessage: {
                            content: "Debug Info",
                            responseType: ResponseType.Debug,
                        },
                    },
                },
            });
        });

        await waitFor(() => {
            expect(result.current.generatingContent).toContain("Debug Info");
        });

        // Reasoning content
        act(() => {
            global.__subscriptionCallbacks?.onData({
                data: {
                    data: {
                        generateMessage: {
                            content: "Reasoning Step",
                            responseType: ResponseType.Reasoning,
                        },
                    },
                },
            });
        });

        await waitFor(() => {
            expect(result.current.generatingContent).toContain("Debug Info");
            expect(result.current.generatingContent).toContain(
                "Reasoning Step"
            );
        });
    });
});
