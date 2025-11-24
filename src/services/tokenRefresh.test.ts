import { User } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setAuthToken } from "../apolloClient";
import { auth } from "../components/firebase";
import {
    cleanupTokenRefresh,
    initializeTokenRefresh,
    setOnTokenRefresh,
} from "./tokenRefresh";

// Mock the modules
vi.mock("../components/firebase", () => ({
    auth: {
        onIdTokenChanged: vi.fn(),
        currentUser: null,
    },
}));

vi.mock("../apolloClient", () => ({
    setAuthToken: vi.fn(),
}));

describe("tokenRefresh", () => {
    let mockUser: Partial<User>;
    let onIdTokenChangedCallback: ((user: User | null) => void) | null = null;
    let unsubscribe: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        mockUser = {
            getIdToken: vi.fn().mockResolvedValue("mock-token-123"),
        };

        unsubscribe = vi.fn();

        // Mock onIdTokenChanged to capture the callback
        vi.mocked(auth.onIdTokenChanged).mockImplementation((callback) => {
            onIdTokenChangedCallback = callback as (user: User | null) => void;
            return unsubscribe;
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        cleanupTokenRefresh();
        onIdTokenChangedCallback = null;
    });

    describe("initializeTokenRefresh", () => {
        it("should set up onIdTokenChanged listener", () => {
            initializeTokenRefresh();

            expect(auth.onIdTokenChanged).toHaveBeenCalledTimes(1);
            expect(auth.onIdTokenChanged).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it("should refresh token when user signs in", async () => {
            initializeTokenRefresh();

            // Simulate user sign-in
            await onIdTokenChangedCallback?.(mockUser as User);

            expect(mockUser.getIdToken).toHaveBeenCalledWith(false);
            expect(setAuthToken).toHaveBeenCalledWith("mock-token-123");
        });

        it("should clear token when user signs out", async () => {
            initializeTokenRefresh();

            // Simulate user sign-out
            await onIdTokenChangedCallback?.(null);

            expect(setAuthToken).toHaveBeenCalledWith(null);
        });

        it("should set up periodic token refresh interval", () => {
            initializeTokenRefresh();

            expect(vi.getTimerCount()).toBeGreaterThan(0);
        });

        it("should force refresh token after 50 minutes", async () => {
            // Set up current user
            (
                vi.mocked(auth) as unknown as { currentUser: User | null }
            ).currentUser = mockUser as User;

            initializeTokenRefresh();

            // Fast-forward time by 50 minutes
            await vi.advanceTimersByTimeAsync(50 * 60 * 1000);

            expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
            expect(setAuthToken).toHaveBeenCalledWith("mock-token-123");
        });

        it("should invoke callback when token is refreshed", async () => {
            const mockCallback = vi.fn();
            setOnTokenRefresh(mockCallback);

            initializeTokenRefresh();

            // Simulate token change and wait for async completion
            const promise = onIdTokenChangedCallback?.(mockUser as User);
            await promise;

            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it("should invoke callback on periodic refresh", async () => {
            const mockCallback = vi.fn();
            setOnTokenRefresh(mockCallback);

            (
                vi.mocked(auth) as unknown as { currentUser: User | null }
            ).currentUser = mockUser as User;

            initializeTokenRefresh();

            // Fast-forward time by 50 minutes
            await vi.advanceTimersByTimeAsync(50 * 60 * 1000);

            expect(mockCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe("cleanupTokenRefresh", () => {
        it("should unsubscribe from onIdTokenChanged", () => {
            initializeTokenRefresh();
            cleanupTokenRefresh();

            expect(unsubscribe).toHaveBeenCalledTimes(1);
        });

        it("should clear the refresh interval", () => {
            initializeTokenRefresh();

            const timerCountBefore = vi.getTimerCount();
            expect(timerCountBefore).toBeGreaterThan(0);

            cleanupTokenRefresh();

            const timerCountAfter = vi.getTimerCount();
            expect(timerCountAfter).toBe(0);
        });

        it("should preserve the callback for re-initialization", async () => {
            const mockCallback = vi.fn();
            setOnTokenRefresh(mockCallback);

            initializeTokenRefresh();
            cleanupTokenRefresh();

            // Re-initialize and trigger token change
            initializeTokenRefresh();
            const promise = onIdTokenChangedCallback?.(mockUser as User);
            await promise;

            // Callback should still be invoked after cleanup and re-init
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe("setOnTokenRefresh", () => {
        it("should set a callback that gets invoked on token refresh", async () => {
            const mockCallback = vi.fn();
            setOnTokenRefresh(mockCallback);

            initializeTokenRefresh();

            const promise = onIdTokenChangedCallback?.(mockUser as User);
            await promise;

            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it("should replace existing callback", async () => {
            const firstCallback = vi.fn();
            const secondCallback = vi.fn();

            setOnTokenRefresh(firstCallback);
            setOnTokenRefresh(secondCallback);

            initializeTokenRefresh();

            const promise = onIdTokenChangedCallback?.(mockUser as User);
            await promise;

            expect(firstCallback).not.toHaveBeenCalled();
            expect(secondCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe("error handling", () => {
        it("should handle getIdToken errors gracefully", async () => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {
                    // Suppress console.error during test
                });

            const errorUser = {
                getIdToken: vi
                    .fn()
                    .mockRejectedValue(new Error("Token fetch failed")),
            };

            initializeTokenRefresh();
            await onIdTokenChangedCallback?.(errorUser as unknown as User);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Failed to refresh token:",
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });
    });
});
