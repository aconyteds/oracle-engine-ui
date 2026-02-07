import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { MessageInput } from "./MessageInput";

// Mock dependencies
const mockSendMessage = vi.fn();
const mockAbortCurrentGeneration = vi.fn();

vi.mock("@context", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@context")>();
    return {
        ...actual,
        useThreadsContext: vi.fn(),
    };
});

// Mock ExpandingTextArea to expose onSubmit/onChange directly
vi.mock("../Common", () => ({
    ExpandingTextArea: ({
        onSubmit,
        onChange,
        styleProps,
        placeholder,
    }: {
        onSubmit?: (text: string) => void;
        onChange?: (text: string) => void;
        placeholder?: string;
        styleProps?: { disabled?: boolean; className?: string };
    }) => (
        <textarea
            data-testid="mock-textarea"
            placeholder={placeholder}
            disabled={styleProps?.disabled}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const target = e.target as HTMLTextAreaElement;
                    onSubmit?.(target.value);
                }
            }}
        />
    ),
}));

import { useThreadsContext } from "@context";

const mockUseThreadsContext = vi.mocked(useThreadsContext);

const setupMocks = ({
    isGenerating = false,
    canStartGeneration = true,
} = {}) => {
    mockUseThreadsContext.mockReturnValue({
        sendMessage: mockSendMessage,
        isGenerating,
        canStartGeneration,
        abortCurrentGeneration: mockAbortCurrentGeneration,
    } as unknown as ReturnType<typeof useThreadsContext>);
};

describe("MessageInput", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe("whitespace submission guard", () => {
        test.each(["   ", "\t", "\n", "  \t\n  "])(
            "should not send whitespace-only text %j via Enter",
            (whitespace) => {
                render(<MessageInput />);
                const textarea = screen.getByTestId("mock-textarea");

                fireEvent.change(textarea, {
                    target: { value: whitespace },
                });
                fireEvent.keyDown(textarea, {
                    key: "Enter",
                    shiftKey: false,
                });

                expect(mockSendMessage).not.toHaveBeenCalled();
            }
        );

        test("should send valid text via Enter", () => {
            render(<MessageInput />);
            const textarea = screen.getByTestId("mock-textarea");

            fireEvent.change(textarea, {
                target: { value: "Hello world" },
            });
            fireEvent.keyDown(textarea, {
                key: "Enter",
                shiftKey: false,
            });

            expect(mockSendMessage).toHaveBeenCalledWith("Hello world");
        });
    });

    describe("send button", () => {
        test("should be disabled when text is empty", () => {
            render(<MessageInput />);
            const button = screen.getByTitle("Send a Message to the AI");
            expect(button).toBeDisabled();
        });

        test("should not call sendMessage when canStartGeneration is false", () => {
            setupMocks({ canStartGeneration: false });
            render(<MessageInput />);
            const textarea = screen.getByTestId("mock-textarea");

            fireEvent.change(textarea, {
                target: { value: "Hello" },
            });
            fireEvent.keyDown(textarea, {
                key: "Enter",
                shiftKey: false,
            });

            expect(mockSendMessage).not.toHaveBeenCalled();
        });
    });

    describe("abort button", () => {
        test("should show abort button when generating", () => {
            setupMocks({ isGenerating: true });
            render(<MessageInput />);

            expect(screen.getByTitle("Cancel Generation")).toBeInTheDocument();
        });

        test("should call abortCurrentGeneration on click", () => {
            setupMocks({ isGenerating: true });
            render(<MessageInput />);

            fireEvent.click(screen.getByTitle("Cancel Generation"));
            expect(mockAbortCurrentGeneration).toHaveBeenCalledOnce();
        });

        test("should disable textarea when generating", () => {
            setupMocks({ isGenerating: true });
            render(<MessageInput />);

            expect(screen.getByTestId("mock-textarea")).toBeDisabled();
        });
    });
});
