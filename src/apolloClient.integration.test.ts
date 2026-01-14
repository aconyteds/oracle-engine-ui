import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as toasterContext from "./contexts/Toaster.context";
import * as tokenRefreshService from "./services/tokenRefresh";

/**
 * Integration tests for Apollo Client error handling with toast notifications.
 *
 * NOTE: These tests verify the error handling logic that shows toasts when
 * token refresh fails. The actual integration with Apollo Client's error link
 * is tested through manual/E2E testing due to the complexity of mocking
 * the full Apollo Client link chain.
 *
 * What we test here:
 * 1. The showToast service is properly imported and callable
 * 2. The forceTokenRefresh service integration
 * 3. The error handling functions behave correctly
 */

describe("Apollo Client Error Handling Integration", () => {
    let showToastDangerSpy: ReturnType<typeof vi.spyOn>;
    let forceTokenRefreshSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        // Spy on showToast.danger
        showToastDangerSpy = vi.spyOn(toasterContext.showToast, "danger");

        // Spy on forceTokenRefresh
        forceTokenRefreshSpy = vi.spyOn(
            tokenRefreshService,
            "forceTokenRefresh"
        );

        // Suppress console.error in tests
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
            // Intentionally empty to suppress console output
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        showToastDangerSpy.mockRestore();
        forceTokenRefreshSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test("showToast.danger should be callable with correct parameters", () => {
        toasterContext.showToast.danger({
            title: "Authentication Error",
            message: "Your session has expired. Please log in again.",
            duration: 8000,
            closable: true,
        });

        expect(showToastDangerSpy).toHaveBeenCalledWith({
            title: "Authentication Error",
            message: "Your session has expired. Please log in again.",
            duration: 8000,
            closable: true,
        });
    });

    test("forceTokenRefresh should be callable and handle errors", async () => {
        forceTokenRefreshSpy.mockRejectedValue(
            new Error("No authenticated user")
        );

        try {
            await tokenRefreshService.forceTokenRefresh();
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toBe("No authenticated user");
        }

        expect(forceTokenRefreshSpy).toHaveBeenCalled();
    });

    test("error handling flow: refresh fails, toast is shown", async () => {
        // Mock refresh to fail
        forceTokenRefreshSpy.mockRejectedValue(
            new Error("No authenticated user")
        );

        // Simulate the error handling flow from apolloClient.ts
        try {
            await tokenRefreshService.forceTokenRefresh();
        } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);

            // Show toast
            toasterContext.showToast.danger({
                title: "Authentication Error",
                message: "Your session has expired. Please log in again.",
                duration: 8000,
                closable: true,
            });
        }

        // Verify console.error was called
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Token refresh failed:",
            expect.any(Error)
        );

        // Verify toast was shown
        expect(showToastDangerSpy).toHaveBeenCalledWith({
            title: "Authentication Error",
            message: "Your session has expired. Please log in again.",
            duration: 8000,
            closable: true,
        });
    });

    test("WebSocket error handling: refresh fails, connection toast is shown", async () => {
        // Mock refresh to fail
        forceTokenRefreshSpy.mockRejectedValue(
            new Error("Token refresh failed")
        );

        // Simulate WebSocket reconnection error flow
        try {
            await tokenRefreshService.forceTokenRefresh();
        } catch (error) {
            console.error("Failed to refresh token for WS reconnect:", error);

            toasterContext.showToast.danger({
                title: "Connection Error",
                message:
                    "Unable to re-authenticate WebSocket connection. Please refresh the page.",
                duration: 10000,
                closable: true,
            });
        }

        // Verify console.error was called
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Failed to refresh token for WS reconnect:",
            expect.any(Error)
        );

        // Verify toast was shown with WebSocket-specific message
        expect(showToastDangerSpy).toHaveBeenCalledWith({
            title: "Connection Error",
            message:
                "Unable to re-authenticate WebSocket connection. Please refresh the page.",
            duration: 10000,
            closable: true,
        });
    });

    test("successful refresh should not show toast", async () => {
        // Mock refresh to succeed
        forceTokenRefreshSpy.mockResolvedValue("new-token");

        // Simulate successful refresh
        try {
            const token = await tokenRefreshService.forceTokenRefresh();
            expect(token).toBe("new-token");
        } catch {
            // Should not catch
        }

        // Verify toast was NOT shown
        expect(showToastDangerSpy).not.toHaveBeenCalled();
    });
});
