import { cleanup, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";
import { LogEvent } from "./components/firebase";

vi.mock("./components/firebase", async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import("./components/firebase");
    return {
        ...actual,
        LogEvent: vi.fn(),
    };
});
vi.mock("./components/Router");
vi.mock("./components/Login");
vi.mock("./components/Layout");
vi.mock("./components/Subscription");
vi.mock("@context", () => ({
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    UserProvider: ({ children }: { children: React.ReactNode }) => children,
    CampaignProvider: ({ children }: { children: React.ReactNode }) => children,
    ThreadsProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe("App Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        window.history.pushState({}, "", "/");
    });

    it("Loads the initial component", () => {
        render(<App />);
        expect(true).toBe(true);
    });

    it("calls LogEvent on load", () => {
        render(<App />);
        expect(LogEvent).toHaveBeenCalledWith("load");
    });

    describe("subscription routes", () => {
        const originalMonetization = import.meta.env.VITE_MONETIZATION_ENABLED;

        afterEach(() => {
            (import.meta.env as Record<string, string>).VITE_MONETIZATION_ENABLED = originalMonetization;
        });

        it("redirects /subscription to / when monetization is disabled", () => {
            (
                import.meta.env as Record<string, string>
            ).VITE_MONETIZATION_ENABLED = "false";
            window.history.pushState({}, "", "/subscription");

            render(<App />);

            expect(window.location.pathname).toBe("/");
        });

        it("does not redirect /subscription when monetization is enabled", () => {
            (
                import.meta.env as Record<string, string>
            ).VITE_MONETIZATION_ENABLED = "true";
            window.history.pushState({}, "", "/subscription");

            render(<App />);

            expect(window.location.pathname).toBe("/subscription");
        });
    });
});
