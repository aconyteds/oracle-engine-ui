import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { HistoryThreadItem } from "./HistoryThreadItem";

// Mock useRelativeTime hook - use importOriginal to keep other exports
vi.mock("@hooks", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@hooks")>();
    return {
        ...actual,
        useRelativeTime: vi.fn(() => "5 minutes"),
    };
});

const mockOnSelect = vi.fn();
const mockOnTogglePin = vi.fn();

const createThread = (
    overrides: Partial<Parameters<typeof HistoryThreadItem>[0]["thread"]> = {}
) => ({
    id: "thread-1",
    title: "Test Thread",
    lastUsed: new Date("2024-01-15T12:00:00Z"),
    isPinned: false,
    ...overrides,
});

const defaultProps = {
    thread: createThread(),
    isSelected: false,
    onSelect: mockOnSelect,
    onTogglePin: mockOnTogglePin,
};

describe("HistoryThreadItem", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe("rendering", () => {
        test("should render thread title and relative time", () => {
            render(<HistoryThreadItem {...defaultProps} />);

            expect(screen.getByText("Test Thread")).toBeInTheDocument();
            expect(screen.getByText("5 minutes")).toBeInTheDocument();
            expect(screen.getByText("ago")).toBeInTheDocument();
        });

        test.each([
            { isGenerating: true, expectedVisible: true },
            { isGenerating: false, expectedVisible: false },
            { isGenerating: undefined, expectedVisible: false },
        ])(
            "should $expectedVisible spinner when isGenerating=$isGenerating",
            ({ isGenerating, expectedVisible }) => {
                render(
                    <HistoryThreadItem
                        {...defaultProps}
                        isGenerating={isGenerating}
                    />
                );

                const spinner = screen.queryByTitle("Generating...");
                if (expectedVisible) {
                    expect(spinner).toBeInTheDocument();
                } else {
                    expect(spinner).not.toBeInTheDocument();
                }
            }
        );

        test.each([
            {
                isSelected: true,
                isGenerating: true,
                expectedClass: "text-warning",
            },
            {
                isSelected: false,
                isGenerating: true,
                expectedClass: "text-primary",
            },
        ])(
            "should apply $expectedClass to spinner when isSelected=$isSelected",
            ({ isSelected, expectedClass }) => {
                const { container } = render(
                    <HistoryThreadItem
                        {...defaultProps}
                        isSelected={isSelected}
                        isGenerating={true}
                    />
                );

                // FontAwesomeIcon applies className to the svg element with fa-spinner class
                const spinner = container.querySelector("svg.fa-spinner");
                expect(spinner).toBeInTheDocument();
                expect(spinner).toHaveClass(expectedClass);
            }
        );

        test.each([
            {
                isPinned: true,
                expectedLabel: "Unfavorite thread",
                expectedIconClass: "text-warning",
            },
            {
                isPinned: false,
                expectedLabel: "Favorite thread",
                expectedIconClass: "text-muted",
            },
        ])(
            "should render pin button with label=$expectedLabel when isPinned=$isPinned",
            ({ isPinned, expectedLabel, expectedIconClass }) => {
                render(
                    <HistoryThreadItem
                        {...defaultProps}
                        thread={createThread({ isPinned })}
                    />
                );

                const button = screen.getByRole("button", {
                    name: expectedLabel,
                });
                expect(button).toBeInTheDocument();

                const icon = button.querySelector("svg");
                expect(icon).toHaveClass(expectedIconClass);
            }
        );
    });

    describe("interactions", () => {
        test("should call onSelect with thread id when clicked", () => {
            render(<HistoryThreadItem {...defaultProps} />);

            const item = screen
                .getByText("Test Thread")
                .closest(".dropdown-item");
            fireEvent.click(item!);

            expect(mockOnSelect).toHaveBeenCalledWith("thread-1");
            expect(mockOnSelect).toHaveBeenCalledTimes(1);
        });

        test("should call onTogglePin with correct args and stop propagation", () => {
            const thread = createThread({ isPinned: false });
            render(<HistoryThreadItem {...defaultProps} thread={thread} />);

            const pinButton = screen.getByRole("button", {
                name: "Favorite thread",
            });
            fireEvent.click(pinButton);

            expect(mockOnTogglePin).toHaveBeenCalledWith(
                "thread-1",
                true, // Toggle from false to true
                expect.any(Object) // MouseEvent
            );
            expect(mockOnTogglePin).toHaveBeenCalledTimes(1);
            // onSelect should NOT be called due to stopPropagation
            expect(mockOnSelect).not.toHaveBeenCalled();
        });

        test("should toggle pin from true to false when already pinned", () => {
            const thread = createThread({ isPinned: true });
            render(<HistoryThreadItem {...defaultProps} thread={thread} />);

            const pinButton = screen.getByRole("button", {
                name: "Unfavorite thread",
            });
            fireEvent.click(pinButton);

            expect(mockOnTogglePin).toHaveBeenCalledWith(
                "thread-1",
                false, // Toggle from true to false
                expect.any(Object)
            );
        });
    });

    describe("selected state", () => {
        test("should have active class when selected", () => {
            render(<HistoryThreadItem {...defaultProps} isSelected={true} />);

            const item = screen
                .getByText("Test Thread")
                .closest(".dropdown-item");
            expect(item).toHaveClass("active");
        });

        test("should not have active class when not selected", () => {
            render(<HistoryThreadItem {...defaultProps} isSelected={false} />);

            const item = screen
                .getByText("Test Thread")
                .closest(".dropdown-item");
            expect(item).not.toHaveClass("active");
        });
    });
});
