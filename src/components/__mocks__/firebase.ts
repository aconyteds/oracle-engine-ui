import { vi } from "vitest";

export const auth = {
    currentUser: { uid: "test-user", email: "test@example.com" },
    signInWithEmailAndPassword: vi.fn(() =>
        Promise.resolve({
            user: { uid: "test-user", email: "test@example.com" },
        })
    ),
    signOut: vi.fn(() => Promise.resolve()),
    onAuthStateChanged: vi.fn((callback) => {
        // Mock a listener that simulates being called and returns an unsubscribe function
        const unsubscribe = () => {};
        callback({ uid: "test-user", email: "test@example.com" });
        return unsubscribe;
    }),
};

export const googleProvider = {
    setCustomParameters: vi.fn(),
};

export const signInWithPopup = vi.fn(() =>
    Promise.resolve({ user: { uid: "test-user", email: "test@example.com" } })
);

export const analytics = {
    logEvent: vi.fn((eventName, params) => {
        console.log(`Analytics event logged: ${eventName}`, params);
    }),
};

// Mock the LogEvent function to use the mocked analytics.logEvent
export const LogEvent = (
    eventName: string,
    params?: { [key: string]: string }
) => {
    analytics.logEvent(eventName, params);
};
