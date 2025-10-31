import { User } from "firebase/auth";
import { setAuthToken } from "../apolloClient";
import { auth } from "../components/firebase";

// Refresh token every 50 minutes (tokens expire after 60 minutes)
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000;

let refreshInterval: NodeJS.Timeout | null = null;
let unsubscribeIdTokenChanged: (() => void) | null = null;

/**
 * Refreshes the Firebase ID token and updates Apollo Client
 */
async function refreshToken(
    user: User,
    forceRefresh = false
): Promise<boolean> {
    try {
        const token = await user.getIdToken(forceRefresh);
        setAuthToken(token);
        return true;
    } catch (error) {
        console.error("Failed to refresh token:", error);
        return false;
    }
}

/**
 * Callback type for when token is refreshed
 */
type TokenRefreshCallback = () => void;

let onTokenRefreshCallback: TokenRefreshCallback | null = null;

/**
 * Set a callback to be invoked when the token is refreshed
 */
export function setOnTokenRefresh(callback: TokenRefreshCallback): void {
    onTokenRefreshCallback = callback;
}

/**
 * Initializes the token refresh service
 * - Sets up Firebase onIdTokenChanged listener
 * - Establishes periodic token refresh interval
 */
export function initializeTokenRefresh(): void {
    // Clean up existing listeners if any
    cleanupTokenRefresh();

    // Listen for token changes from Firebase
    unsubscribeIdTokenChanged = auth.onIdTokenChanged(async (user) => {
        if (user) {
            // Token changed (sign-in, sign-out, or auto-refresh)
            const success = await refreshToken(user, false);

            // Notify callback (e.g., to restart WebSocket)
            if (success && onTokenRefreshCallback) {
                onTokenRefreshCallback();
            }
        } else {
            // User signed out, clear token
            setAuthToken(null);
        }
    });

    // Set up periodic token refresh
    refreshInterval = setInterval(async () => {
        const user = auth.currentUser;
        if (user) {
            // Force refresh to get a new token before expiration
            const success = await refreshToken(user, true);

            // Notify callback (e.g., to restart WebSocket)
            if (success && onTokenRefreshCallback) {
                onTokenRefreshCallback();
            }
        }
    }, TOKEN_REFRESH_INTERVAL);
}

/**
 * Cleans up token refresh service
 * - Removes Firebase listener
 * - Clears refresh interval
 * Note: Does not clear the callback, as it may be set before initialization
 */
export function cleanupTokenRefresh(): void {
    if (unsubscribeIdTokenChanged) {
        unsubscribeIdTokenChanged();
        unsubscribeIdTokenChanged = null;
    }

    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }

    // Don't clear the callback - it should persist across cleanup/re-initialization
}
