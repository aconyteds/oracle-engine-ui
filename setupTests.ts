import "@testing-library/jest-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { vi } from "vitest";

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
