import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ToasterProvider, useToaster } from "./Toaster.context";

vi.mock("react-bootstrap", () => ({
    Toast: Object.assign(
        ({ children, onClose }: any) => (
            <div data-testid="mock-toast" onClick={onClose}>
                {children}
            </div>
        ),
        {
            Header: ({ children }: any) => (
                <div data-testid="mock-toast-header">{children}</div>
            ),
            Body: ({ children }: any) => (
                <div data-testid="mock-toast-body">{children}</div>
            ),
        }
    ),
    ToastContainer: ({ children }: any) => (
        <div data-testid="mock-toast-container">{children}</div>
    ),
}));

// Test component to use the hook
const TestComponent = ({ closable = false }) => {
    const { toast } = useToaster();
    return (
        <button onClick={() => toast.success({ message: "Test", closable })}>
            Show Toast
        </button>
    );
};

describe("ToasterContext", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it("should throw error when useToaster is used outside provider", () => {
        const consoleError = console.error;
        console.error = vi.fn(); // Suppress React error logging

        expect(() => render(<TestComponent />)).toThrow(
            "useToaster must be used within a ToasterProvider"
        );

        console.error = consoleError;
    });

    it("should render provider without crashing", () => {
        const { container } = render(
            <ToasterProvider>
                <div>Test</div>
            </ToasterProvider>
        );
        expect(container).toBeTruthy();
    });

    it("should show success toast", () => {
        render(
            <ToasterProvider>
                <TestComponent />
            </ToasterProvider>
        );

        act(() => {
            screen.getByRole("button").click();
        });

        const toast = screen.getByTestId("mock-toast");
        expect(toast).toBeInTheDocument();
        expect(screen.getByTestId("mock-toast-body")).toHaveTextContent("Test");
    });

    it("should auto-remove toast after duration", () => {
        render(
            <ToasterProvider>
                <TestComponent />
            </ToasterProvider>
        );

        act(() => {
            screen.getByRole("button").click();
        });

        expect(screen.getByTestId("mock-toast")).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.queryByTestId("mock-toast")).not.toBeInTheDocument();
    });

    it("should handle custom duration", () => {
        const TestCustomDuration = () => {
            const { toast } = useToaster();
            return (
                <button
                    onClick={() =>
                        toast.success({ message: "Test", duration: 10000 })
                    }
                >
                    Show Toast
                </button>
            );
        };

        render(
            <ToasterProvider>
                <TestCustomDuration />
            </ToasterProvider>
        );

        act(() => {
            screen.getByRole("button").click();
        });

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.getByTestId("mock-toast")).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.queryByTestId("mock-toast")).not.toBeInTheDocument();
    });

    it("should handle permanent toasts", () => {
        const TestPermanentToast = () => {
            const { toast } = useToaster();
            return (
                <button
                    onClick={() =>
                        toast.success({ message: "Test", duration: null })
                    }
                >
                    Show Toast
                </button>
            );
        };

        render(
            <ToasterProvider>
                <TestPermanentToast />
            </ToasterProvider>
        );

        act(() => {
            screen.getByRole("button").click();
        });

        act(() => {
            vi.advanceTimersByTime(10000);
        });

        expect(screen.getByTestId("mock-toast")).toBeInTheDocument();
    });

    it("manually closing a toast should not be possible when closable is false", async () => {
        render(
            <ToasterProvider>
                <TestComponent closable={false} />
            </ToasterProvider>
        );

        act(() => {
            screen.getByRole("button").click();
        });

        const toast = screen.getByTestId("mock-toast");
        expect(toast).toBeInTheDocument();

        act(() => {
            toast.click();
        });

        expect(screen.getByTestId("mock-toast")).toBeInTheDocument();
    });

    it("should handle closing toast manually", async () => {
        render(
            <ToasterProvider>
                <TestComponent closable={true} />
            </ToasterProvider>
        );

        act(() => {
            screen.getByRole("button").click();
        });

        const toast = screen.getByTestId("mock-toast");
        expect(toast).toBeInTheDocument();

        act(() => {
            toast.click();
        });

        expect(screen.queryByTestId("mock-toast")).not.toBeInTheDocument();
    });
});
