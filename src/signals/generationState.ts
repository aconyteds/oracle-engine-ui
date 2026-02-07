import type {
    ActiveGenerationDataFragment,
    GenerateMessageSubscription,
    MessageDetailsFragment,
} from "@graphql";
import {
    AbortGenerationDocument,
    GenerateMessageDocument,
    GenerationStatus,
    RecordType,
    ResponseType,
} from "@graphql";
import { signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import client from "../apolloClient";
import { LogEvent } from "../components/firebase";
import { showToast } from "../contexts/Toaster.context";

// Pattern to detect asset creation/update messages from AI
// Matches: "Created [Name](Type:id)" or "Updated [Name](Type:id)"
// Imported from useMessageGeneration pattern
const ASSET_PATTERN_VALUES = Object.values(RecordType);
const ASSET_PATTERN = new RegExp(
    `(created|updated)\\s+\\[([^\\]]+)\\]\\((${ASSET_PATTERN_VALUES.join(
        "|"
    )}):([^)]+)\\)`,
    "i"
);

// ============================================================================
// Types
// ============================================================================

export interface GenerationCallbacks {
    onComplete: (message: MessageDetailsFragment, threadId: string) => void;
    onError?: (error: Error) => void;
    onAssetModified?: (assetType: string, assetId: string) => void;
}

export interface GenerationState {
    threadId: string;
    threadTitle: string;
    phase: GenerationStatus;
    content: string;
    error: Error | null;
    startedAt: Date;
    subscription: { unsubscribe: () => void } | null;
    callbacks: GenerationCallbacks;
}

export interface StartGenerationOptions {
    isReconnection?: boolean;
    showDebug?: boolean;
}

// ============================================================================
// Signals
// ============================================================================

// Main state: Map of threadId -> GenerationState
export const generationsSignal = signal<Map<string, GenerationState>>(
    new Map()
);

// Track which threadId is currently selected (set by ThreadsContext)
export const selectedThreadIdSignal = signal<string | null>(null);

// Track if browser notification permission has been requested this session
export const notificationPermissionSignal =
    signal<NotificationPermission>("default");

// LocalStorage key for tracking if user has been asked about notifications
const NOTIFICATION_PERMISSION_ASKED_KEY = "notificationPermissionAsked";

/**
 * Check if the user has already been asked about notification permissions.
 */
function hasAskedForNotificationPermission(): boolean {
    return localStorage.getItem(NOTIFICATION_PERMISSION_ASKED_KEY) === "true";
}

/**
 * Mark that we've asked the user about notification permissions.
 */
function markNotificationPermissionAsked(): void {
    localStorage.setItem(NOTIFICATION_PERMISSION_ASKED_KEY, "true");
}

function isGenerating(phase: GenerationStatus): boolean {
    return (
        phase === GenerationStatus.Pending || phase === GenerationStatus.Running
    );
}

// ============================================================================
// Browser Notification Utilities
// ============================================================================

/**
 * Request browser notification permission.
 * Only requests if permission hasn't been determined yet.
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
        return false;
    }

    if (Notification.permission === "granted") {
        notificationPermissionSignal.value = "granted";
        return true;
    }

    if (Notification.permission === "denied") {
        notificationPermissionSignal.value = "denied";
        return false;
    }

    // Request permission
    try {
        const permission = await Notification.requestPermission();
        notificationPermissionSignal.value = permission;
        return permission === "granted";
    } catch (error) {
        console.error("Error requesting notification permission:", error);
        return false;
    }
}

/**
 * Show a browser notification for generation completion.
 * Only shows if permission granted. Caller should check visibility.
 */
function showBrowserNotification(threadId: string, threadTitle: string): void {
    if (Notification.permission !== "granted") {
        return;
    }

    try {
        const notification = new Notification("Oracle Engine", {
            body: `Generation complete: ${threadTitle}`,
            icon: "/OEFavicon.svg",
            tag: `generation-${threadId}`, // Prevents duplicate notifications
        });

        notification.onclick = () => {
            window.focus();
            // Dispatch custom event for thread navigation
            window.dispatchEvent(
                new CustomEvent("select-thread", { detail: { threadId } })
            );
            notification.close();
        };
    } catch (error) {
        console.error("Error showing notification:", error);
    }
}

/**
 * Show toast notification for generation completion on non-active thread.
 * Note: We show a simple toast since ToastOptions doesn't support action buttons.
 * Users can navigate to the thread via the history menu.
 */
function showCompletionToast(threadTitle: string, threadId: string): void {
    showToast.success({
        title: "Generation Complete",
        message: `${threadTitle} - Click here to see the response.`,
        duration: 10000,
        closable: true,
        onClick: () => {
            // Dispatch custom event for thread navigation
            window.dispatchEvent(
                new CustomEvent("select-thread", { detail: { threadId } })
            );
        },
    });
}

// ============================================================================
// Subscription Creation
// ============================================================================

/**
 * Creates an Apollo subscription for a generation.
 * Uses client.subscribe() directly instead of React hooks for lifecycle independence.
 */
function createSubscription(
    threadId: string,
    callbacks: GenerationCallbacks,
    options: StartGenerationOptions = {}
): { unsubscribe: () => void } {
    const { showDebug = false } = options;

    const observable = client.subscribe<GenerateMessageSubscription>({
        query: GenerateMessageDocument,
        variables: {
            generateMessageInput: { threadId },
        },
    });

    const subscription = observable.subscribe({
        next: ({ data }) => {
            if (!data?.generateMessage) return;

            const { content, message, responseType } = data.generateMessage;

            // Final message - generation complete
            if (message) {
                generationManager.completeGeneration(
                    threadId,
                    message as MessageDetailsFragment
                );
                return;
            }

            if (!content) return;

            // Determine if we should show this content
            let showContent = responseType === ResponseType.Intermediate;

            if (showDebug) {
                showContent = [
                    ResponseType.Intermediate,
                    ResponseType.Debug,
                    ResponseType.Reasoning,
                ].some((type) => responseType === type);
                console.debug(`${responseType}: ${content}`);
            }

            if (!showContent) return;

            // Check for asset creation/update patterns
            if (
                responseType === ResponseType.Intermediate &&
                callbacks.onAssetModified
            ) {
                const match = content.match(ASSET_PATTERN);
                if (match) {
                    const assetType = match[3];
                    const assetId = match[4];
                    callbacks.onAssetModified(assetType, assetId);
                }
            }

            // Append content to generation state
            generationManager.appendContent(threadId, content);
        },
        error: (error) => {
            generationManager.setError(threadId, error as Error);
        },
        complete: () => {
            // Subscription ended without final message - unusual but handle gracefully
            console.warn(
                `Subscription for thread ${threadId} completed without final message`
            );
        },
    });

    return subscription;
}

// ============================================================================
// Generation Manager
// ============================================================================

export const generationManager = {
    /**
     * Start a new generation for a thread.
     * Returns true if started successfully, false if at limit or already generating.
     */
    startGeneration: (
        threadId: string,
        threadTitle: string,
        callbacks: GenerationCallbacks,
        options: StartGenerationOptions = {}
    ): boolean => {
        const { isReconnection = false } = options;

        // Check if already generating on this thread
        if (generationsSignal.value.has(threadId)) {
            console.warn(
                `Generation already in progress for thread ${threadId}`
            );
            return false;
        }

        // Check concurrent limit (max 3)
        if (!generationManager.canStartGeneration()) {
            showToast.warning({
                title: "Generation Limit Reached",
                message:
                    "Maximum 3 concurrent generations. Please wait for one to complete.",
                duration: 5000,
            });
            return false;
        }

        // Request notification permission on first non-reconnection generation
        // Only ask once ever (persisted in localStorage)
        if (!isReconnection && !hasAskedForNotificationPermission()) {
            markNotificationPermissionAsked();
            requestNotificationPermission();
        }

        LogEvent("generation_start");

        // Create subscription
        const subscription = createSubscription(threadId, callbacks, options);

        // Create new generation state
        const newState: GenerationState = {
            threadId,
            threadTitle,
            phase: GenerationStatus.Pending,
            content: "",
            error: null,
            startedAt: new Date(),
            subscription,
            callbacks,
        };

        // Add to map
        const newMap = new Map(generationsSignal.value);
        newMap.set(threadId, newState);
        generationsSignal.value = newMap;

        return true;
    },

    /**
     * Abort a generation by thread ID.
     * Calls the AbortGeneration mutation and cleans up state.
     */
    abortGeneration: async (threadId: string): Promise<boolean> => {
        const generation = generationsSignal.value.get(threadId);
        if (!generation) {
            console.warn(`No generation found for thread ${threadId}`);
            return false;
        }

        try {
            LogEvent("abort_generation");
            // Call abort mutation
            const result = await client.mutate({
                mutation: AbortGenerationDocument,
                variables: {
                    input: { threadId },
                },
            });

            const success = result.data?.abortGeneration?.success ?? false;

            if (success) {
                // Clean up
                generation.subscription?.unsubscribe();
                generationManager.removeGeneration(threadId);
            }

            return success;
        } catch (error) {
            console.error("Error aborting generation:", error);

            // Still clean up local state on error
            generation.subscription?.unsubscribe();
            generationManager.removeGeneration(threadId);

            return false;
        }
    },

    /**
     * Append content to a generation's accumulated content.
     */
    appendContent: (threadId: string, content: string): void => {
        const generation = generationsSignal.value.get(threadId);
        if (!generation) return;

        const newContent =
            generation.content.length > 0
                ? `${generation.content}\n\n${content}`
                : content;

        const newMap = new Map(generationsSignal.value);
        newMap.set(threadId, {
            ...generation,
            content: newContent,
            phase: GenerationStatus.Running, // Move to running on first content
        });
        generationsSignal.value = newMap;
    },

    /**
     * Complete a generation with the final message.
     * Shows notifications if thread is not active.
     */
    completeGeneration: (
        threadId: string,
        message: MessageDetailsFragment
    ): void => {
        const generation = generationsSignal.value.get(threadId);
        if (!generation) return;

        LogEvent("generation_complete");

        // Unsubscribe
        generation.subscription?.unsubscribe();

        // Call completion callback with threadId so caller can check if selected
        generation.callbacks.onComplete(message, threadId);

        // Check if this thread is currently selected
        const isActiveThread = selectedThreadIdSignal.value === threadId;
        const windowHidden = document.visibilityState === "hidden";

        // Show browser notification if window is hidden (user on different tab)
        // This applies to ALL threads, including the active one
        if (windowHidden) {
            showBrowserNotification(threadId, generation.threadTitle);
        }
        // Show toast for non-active threads when window is visible
        else if (!isActiveThread) {
            showCompletionToast(generation.threadTitle, threadId);
        }

        // Remove from state
        generationManager.removeGeneration(threadId);
    },

    /**
     * Set an error on a generation.
     */
    setError: (threadId: string, error: Error): void => {
        const generation = generationsSignal.value.get(threadId);
        if (!generation) return;

        LogEvent("generation_error");

        // Unsubscribe
        generation.subscription?.unsubscribe();

        // Call error callback
        generation.callbacks.onError?.(error);

        // Update state with error
        const newMap = new Map(generationsSignal.value);
        newMap.set(threadId, {
            ...generation,
            phase: GenerationStatus.Failed,
            error,
            subscription: null,
        });
        generationsSignal.value = newMap;

        // Remove after a short delay to allow error display
        setTimeout(() => {
            generationManager.removeGeneration(threadId);
        }, 100);
    },

    /**
     * Remove a generation from state.
     */
    removeGeneration: (threadId: string): void => {
        const newMap = new Map(generationsSignal.value);
        newMap.delete(threadId);
        generationsSignal.value = newMap;
    },

    /**
     * Check if a new generation can be started (< 3 active).
     */
    canStartGeneration: (): boolean => {
        const activeCount = Array.from(generationsSignal.value.values()).filter(
            (g) => isGenerating(g.phase)
        ).length;
        return activeCount < 3;
    },

    /**
     * Get the count of active generations.
     */
    getActiveCount: (): number => {
        return Array.from(generationsSignal.value.values()).filter((g) =>
            isGenerating(g.phase)
        ).length;
    },

    /**
     * Check if a specific thread is generating.
     */
    isThreadGenerating: (threadId: string): boolean => {
        const generation = generationsSignal.value.get(threadId);
        if (!generation) return false;
        return isGenerating(generation.phase);
    },

    /**
     * Get the generation state for a thread.
     */
    getGeneration: (threadId: string): GenerationState | undefined => {
        return generationsSignal.value.get(threadId);
    },

    /**
     * Reconnect to all active generations (called on page load).
     * Accepts a simplified type matching the GetActiveGenerations query result.
     */
    reconnectAll: (
        activeGenerations: Array<ActiveGenerationDataFragment>,
        callbacks: GenerationCallbacks,
        options: StartGenerationOptions = {}
    ): void => {
        for (const gen of activeGenerations) {
            // Only reconnect to pending/running generations
            if (!isGenerating(gen.status)) {
                continue;
            }

            // Don't reconnect if already tracking this thread
            if (generationsSignal.value.has(gen.threadId)) {
                continue;
            }

            // Start generation with reconnection flag
            generationManager.startGeneration(
                gen.threadId,
                "Loading...", // Title will be updated when thread data loads
                callbacks,
                { ...options, isReconnection: true }
            );
        }
    },

    /**
     * Clear all generations (called on logout/campaign switch).
     */
    clearAll: (): void => {
        // Unsubscribe all
        for (const generation of generationsSignal.value.values()) {
            generation.subscription?.unsubscribe();
        }

        // Clear map
        generationsSignal.value = new Map();
    },
};

// ============================================================================
// React Hooks
// ============================================================================

/**
 * Hook to access generation state with signal reactivity.
 */
export const useGenerationState = () => {
    useSignals();

    const generations = generationsSignal.value;
    const selectedThreadId = selectedThreadIdSignal.value;

    // Get generation for selected thread
    const currentGeneration = selectedThreadId
        ? generations.get(selectedThreadId)
        : undefined;

    return {
        generations,
        selectedThreadId,
        currentGeneration,
        isGenerating: currentGeneration
            ? isGenerating(currentGeneration.phase)
            : false,
        generatingContent: currentGeneration?.content ?? "",
        canStartGeneration: generationManager.canStartGeneration(),
        activeCount: generationManager.getActiveCount(),
        isThreadGenerating: generationManager.isThreadGenerating,
        getGeneration: generationManager.getGeneration,
    };
};

/**
 * Convenience hook to check if a specific thread is generating.
 */
export const useIsThreadGenerating = (threadId: string): boolean => {
    useSignals();
    return generationManager.isThreadGenerating(threadId);
};
