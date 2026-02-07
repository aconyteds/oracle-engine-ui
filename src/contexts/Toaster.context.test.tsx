import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    setGlobalToastService,
    showToast,
    ToasterProvider,
    useToaster,
} from "./Toaster.context";

vi.mock("react-bootstrap", () => ({
    Toast: Object.assign(
        ({
            children,
            onClose,
        }: {
            children: React.ReactNode;
            onClose: () => void;
        }) => (
            <div data-testid="mock-toast">
                <button data-testid="mock-close" onClick={onClose}>
                    Close
                </button>
                {children}
            </div>
        ),
        {
            Header: ({ children }: { children: React.ReactNode }) => (
                <div data-testid="mock-toast-header">{children}</div>
            ),
            Body: ({
                children,
                onClick,
                role,
                tabIndex,
                onKeyDown,
                style,
            }: {
                children: React.ReactNode;
                onClick?: () => void;
                role?: string;
                tabIndex?: number;
                onKeyDown?: (e: React.KeyboardEvent) => void;
                style?: React.CSSProperties;
            }) => (
                <div
                    data-testid="mock-toast-body"
                    onClick={onClick}
                    role={role}
                    tabIndex={tabIndex}
                    onKeyDown={onKeyDown}
                    style={style}
                >
                    {children}
                </div>
            ),
        }
    ),
    ToastContainer: ({ children }: { children: React.ReactNode }) => (
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
        cleanup();
        vi.clearAllMocks();
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

    it("should still auto-remove toast after duration when closable is false", () => {
        render(
            <ToasterProvider>
                <TestComponent closable={false} />
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

    it("should handle closing toast manually", async () => {
        render(
            <ToasterProvider>
                <TestComponent closable={true} />
            </ToasterProvider>
        );

        act(() => {
            screen.getByRole("button").click();
        });

        expect(screen.getByTestId("mock-toast")).toBeInTheDocument();

        act(() => {
            screen.getByTestId("mock-close").click();
        });

        expect(screen.queryByTestId("mock-toast")).not.toBeInTheDocument();
    });

    it("should trigger onClick on body click, not on close", () => {
        const onClickSpy = vi.fn();
        const TestClickToast = () => {
            const { toast } = useToaster();
            return (
                <button
                    onClick={() =>
                        toast.success({
                            message: "Clickable",
                            title: "Test",
                            onClick: onClickSpy,
                        })
                    }
                >
                    Show Toast
                </button>
            );
        };

        render(
            <ToasterProvider>
                <TestClickToast />
            </ToasterProvider>
        );

        act(() => {
            screen.getByRole("button", { name: "Show Toast" }).click();
        });

        // Clicking the body should trigger onClick
        act(() => {
            screen.getByTestId("mock-toast-body").click();
        });
        expect(onClickSpy).toHaveBeenCalledTimes(1);

        // Clicking close should NOT trigger onClick
        onClickSpy.mockClear();
        act(() => {
            screen.getByTestId("mock-close").click();
        });
        expect(onClickSpy).not.toHaveBeenCalled();
    });

    it("should set role and tabIndex on body when onClick is provided", () => {
        const TestClickableToast = () => {
            const { toast } = useToaster();
            return (
                <button
                    onClick={() =>
                        toast.success({
                            message: "Clickable",
                            onClick: vi.fn(),
                        })
                    }
                >
                    Show Toast
                </button>
            );
        };

        render(
            <ToasterProvider>
                <TestClickableToast />
            </ToasterProvider>
        );

        act(() => {
            screen.getByRole("button", { name: "Show Toast" }).click();
        });

        const body = screen.getByTestId("mock-toast-body");
        expect(body).toHaveAttribute("role", "button");
        expect(body).toHaveAttribute("tabindex", "0");
    });

    describe("Global Toast Service", () => {
        it("should register global toast service on mount", () => {
            const consoleWarnSpy = vi.spyOn(console, "warn");

            // Before provider mounts, showToast should warn
            showToast.success({ message: "Test" });
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                "Toast service not initialized:",
                { message: "Test" }
            );

            consoleWarnSpy.mockRestore();
        });

        it("should allow global toast service to show success toast", () => {
            render(<ToasterProvider>Test</ToasterProvider>);

            act(() => {
                showToast.success({ message: "Global Success" });
            });

            expect(screen.getByTestId("mock-toast")).toBeInTheDocument();
            expect(screen.getByTestId("mock-toast-body")).toHaveTextContent(
                "Global Success"
            );
        });

        it("should allow global toast service to show danger toast", () => {
            render(<ToasterProvider>Test</ToasterProvider>);

            act(() => {
                showToast.danger({
                    title: "Error",
                    message: "Global Error",
                });
            });

            expect(screen.getByTestId("mock-toast")).toBeInTheDocument();
            expect(screen.getByTestId("mock-toast-header")).toHaveTextContent(
                "Error"
            );
            expect(screen.getByTestId("mock-toast-body")).toHaveTextContent(
                "Global Error"
            );
        });

        it("should allow global toast service to show warning toast", () => {
            render(<ToasterProvider>Test</ToasterProvider>);

            act(() => {
                showToast.warning({ message: "Global Warning" });
            });

            expect(screen.getByTestId("mock-toast")).toBeInTheDocument();
            expect(screen.getByTestId("mock-toast-body")).toHaveTextContent(
                "Global Warning"
            );
        });

        it("should allow global toast service to show info toast", () => {
            render(<ToasterProvider>Test</ToasterProvider>);

            act(() => {
                showToast.info({ message: "Global Info" });
            });

            expect(screen.getByTestId("mock-toast")).toBeInTheDocument();
            expect(screen.getByTestId("mock-toast-body")).toHaveTextContent(
                "Global Info"
            );
        });

        it("should unregister global toast service on unmount", () => {
            const consoleWarnSpy = vi.spyOn(console, "warn");

            const { unmount } = render(<ToasterProvider>Test</ToasterProvider>);

            // Service should work while mounted
            act(() => {
                showToast.success({ message: "Test" });
            });
            expect(screen.getByTestId("mock-toast")).toBeInTheDocument();

            // Unmount provider
            unmount();

            // Service should warn after unmount
            showToast.success({ message: "After unmount" });
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                "Toast service not initialized:",
                { message: "After unmount" }
            );

            consoleWarnSpy.mockRestore();
        });

        it("should allow manual registration of toast service", () => {
            const mockService = {
                success: vi.fn(),
                danger: vi.fn(),
                warning: vi.fn(),
                info: vi.fn(),
            };

            setGlobalToastService(mockService);

            showToast.success({ message: "Test" });
            expect(mockService.success).toHaveBeenCalledWith({
                message: "Test",
            });

            showToast.danger({ message: "Error" });
            expect(mockService.danger).toHaveBeenCalledWith({
                message: "Error",
            });

            setGlobalToastService(null);
        });
    });
});
