import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Mock useLocalStorage from the storage module
vi.mock("../hooks/useStorage", () => ({
    useLocalStorage: vi.fn(),
    useSessionStorage: vi.fn(),
}));

import { useLocalStorage } from "../hooks/useStorage";
import { useTheme } from "../hooks/useTheme";
import { ThemeProvider } from "./Theme.context";

// Get reference to the mocked function
const mockUseLocalStorage = vi.mocked(useLocalStorage);

describe("ThemeProvider", () => {
    let mockMatchMedia: ReturnType<typeof vi.fn>;
    let mockAddEventListener: ReturnType<typeof vi.fn>;
    let mockRemoveEventListener: ReturnType<typeof vi.fn>;
    let mockSetMode: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        // Create a fresh setMode mock for each test
        mockSetMode = vi.fn();
        mockUseLocalStorage.mockClear();
        // Set default implementation for tests that don't override it
        mockUseLocalStorage.mockImplementation(() => ["system", mockSetMode]);

        mockAddEventListener = vi.fn();
        mockRemoveEventListener = vi.fn();

        // Mock window.matchMedia
        mockMatchMedia = vi.fn((query: string) => ({
            matches: false,
            media: query,
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: mockMatchMedia,
        });

        // Clear document attributes
        document.documentElement.removeAttribute("data-bs-theme");
        document.body.className = "";
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("should initialize with system theme mode", () => {
        mockUseLocalStorage.mockImplementation(() => ["system", mockSetMode]);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        expect(result.current.mode).toBe("system");
        expect(result.current.theme).toBe("light"); // Default when matchMedia.matches is false
    });

    test("should detect dark system theme", () => {
        mockUseLocalStorage.mockImplementation(() => ["system", mockSetMode]);

        mockMatchMedia.mockReturnValue({
            matches: true,
            media: "(prefers-color-scheme: dark)",
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        expect(result.current.theme).toBe("dark");
    });

    test("should apply light mode when explicitly set", () => {
        mockUseLocalStorage.mockImplementation(() => ["light", mockSetMode]);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        expect(result.current.mode).toBe("light");
        expect(result.current.theme).toBe("light");
    });

    test("should apply dark mode when explicitly set", () => {
        mockUseLocalStorage.mockImplementation(() => ["dark", mockSetMode]);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        expect(result.current.mode).toBe("dark");
        expect(result.current.theme).toBe("dark");
    });

    test("should set document attributes based on theme", async () => {
        mockUseLocalStorage.mockImplementation(() => ["dark", mockSetMode]);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        renderHook(() => useTheme(), { wrapper });

        await waitFor(() => {
            expect(document.documentElement.getAttribute("data-bs-theme")).toBe(
                "dark"
            );
            expect(document.body.className).toBe("theme-dark");
        });
    });

    test("should set light theme document attributes", async () => {
        mockUseLocalStorage.mockImplementation(() => ["light", mockSetMode]);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        renderHook(() => useTheme(), { wrapper });

        await waitFor(() => {
            expect(document.documentElement.getAttribute("data-bs-theme")).toBe(
                "light"
            );
            expect(document.body.className).toBe("theme-light");
        });
    });

    test("should register system theme change listener", () => {
        mockUseLocalStorage.mockImplementation(() => ["system", mockSetMode]);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        renderHook(() => useTheme(), { wrapper });

        expect(mockMatchMedia).toHaveBeenCalledWith(
            "(prefers-color-scheme: dark)"
        );
        expect(mockAddEventListener).toHaveBeenCalledWith(
            "change",
            expect.any(Function)
        );
    });

    test("should cleanup event listener on unmount", () => {
        mockUseLocalStorage.mockImplementation(() => ["system", mockSetMode]);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        const { unmount } = renderHook(() => useTheme(), { wrapper });

        unmount();

        expect(mockRemoveEventListener).toHaveBeenCalledWith(
            "change",
            expect.any(Function)
        );
    });

    test("should provide setMode function", () => {
        mockUseLocalStorage.mockImplementation(() => ["system", mockSetMode]);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        expect(result.current.setMode).toBeDefined();
        expect(typeof result.current.setMode).toBe("function");
    });

    test("should call setMode when changing theme mode", () => {
        mockUseLocalStorage.mockImplementation(() => ["system", mockSetMode]);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => {
            result.current.setMode("dark");
        });

        expect(mockSetMode).toHaveBeenCalledWith("dark");
    });

    test("should provide toggleTheme function", () => {
        mockUseLocalStorage.mockImplementation(() => ["system", mockSetMode]);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        expect(result.current.toggleTheme).toBeDefined();
        expect(typeof result.current.toggleTheme).toBe("function");
    });

    test("should toggle from system mode to opposite of current system theme", () => {
        mockUseLocalStorage.mockImplementation(() => ["system", mockSetMode]);

        // System theme is light (matches: false)
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => {
            result.current.toggleTheme();
        });

        // System is light, so toggle should set to dark
        expect(mockSetMode).toHaveBeenCalledWith("dark");
    });

    test("should toggle from dark to light mode", () => {
        mockUseLocalStorage.mockImplementation(() => ["dark", mockSetMode]);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => {
            result.current.toggleTheme();
        });

        expect(mockSetMode).toHaveBeenCalledWith("light");
    });

    test("should toggle from light to dark mode", () => {
        mockUseLocalStorage.mockImplementation(() => ["light", mockSetMode]);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ThemeProvider>{children}</ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => {
            result.current.toggleTheme();
        });

        expect(mockSetMode).toHaveBeenCalledWith("dark");
    });

    test("useTheme should throw error outside provider", () => {
        // Suppress console.error for this test
        const consoleError = console.error;
        console.error = vi.fn();

        expect(() => {
            renderHook(() => useTheme());
        }).toThrow("useTheme must be used within a ThemeProvider");

        console.error = consoleError;
    });
});
