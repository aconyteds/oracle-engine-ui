import "@testing-library/jest-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { afterAll, beforeAll, vi } from "vitest";

// ============================================================================
// Console Suppression for Expected Test Noise
// ============================================================================
// Store original console methods
const originalConsole = {
    warn: console.warn,
    error: console.error,
    debug: console.debug,
};

// Patterns to suppress (expected noise during tests)
const suppressedPatterns = [
    /Toast service not initialized/, // Toaster.context fallback warning
    /React Router Future Flag Warning/, // React Router v7 migration warnings
    /Debug:|Reasoning:/, // useMessageGeneration debug output
    /go\.apollo\.dev\/c\/err/, // Apollo Client deprecation warnings
    /Consider adding an error boundary/, // React error boundary suggestions
    /was not wrapped in act/, // React act() warnings in async tests
    /Unknown asset type:/, // Expected error in AssetModal tests
    /Error parsing markdown link/, // Expected error in AssetLink tests
    /Uncaught \[Error:/, // jsdom error reporting for expected errors
    /An error occurred!/, // Apollo error messages
];

const shouldSuppress = (args: unknown[]) => {
    const message = args.map(String).join(" ");
    return suppressedPatterns.some((p) => p.test(message));
};

beforeAll(() => {
    console.warn = (...args: unknown[]) => {
        if (!shouldSuppress(args)) {
            originalConsole.warn(...args);
        }
    };
    console.error = (...args: unknown[]) => {
        if (!shouldSuppress(args)) {
            originalConsole.error(...args);
        }
    };
    console.debug = (...args: unknown[]) => {
        if (!shouldSuppress(args)) {
            originalConsole.debug(...args);
        }
    };
});

afterAll(() => {
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
});

// Mock firebase modules before they're imported
vi.mock("firebase/app", () => ({
    initializeApp: vi.fn(() => ({})),
}));

vi.mock("firebase/analytics", () => ({
    getAnalytics: vi.fn(() => ({})),
    logEvent: vi.fn(),
    isSupported: vi.fn(() => Promise.resolve(false)),
}));

vi.mock("firebase/auth", () => ({
    getAuth: vi.fn(() => ({})),
    GoogleAuthProvider: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock window.matchMedia for ThemeProvider
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
