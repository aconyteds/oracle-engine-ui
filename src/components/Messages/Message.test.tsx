import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as UserContext from "@/contexts/User.context";
import { MessageWorkspaceFragment } from "../../graphql/generated";
import { Message } from "./Message";

// Mock the generated graphql types if needed, but we can't easily mock the enum export
// if we import it directly in the component.
// However, since we are using vitest, we can mock the module.
vi.mock("../../graphql/generated", () => ({
    RecordType: {
        Npc: "NPC",
        Location: "Location",
        Plot: "Plot",
    },
    ResponseType: {
        Intermediate: "Intermediate",
        Final: "Final",
    },
}));

// Mock MarkdownRenderer
vi.mock("../Common", () => ({
    MarkdownRenderer: ({ content }: { content: string }) => (
        <div data-testid="markdown-renderer">{content}</div>
    ),
}));

vi.mock("@/contexts/User.context", () => ({
    useUserContext: vi.fn(),
}));

// Mock FeedbackButtons since it has complex dependencies we don't need to test here
vi.mock("./FeedbackButtons", () => ({
    FeedbackButtons: () => <div data-testid="feedback-buttons" />,
}));

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
    FontAwesomeIcon: () => <span data-testid="fa-icon" />,
}));

describe("Message Component", () => {
    const mockUseUserContext = UserContext.useUserContext as ReturnType<
        typeof vi.fn
    >;

    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
        // Default context mock
        mockUseUserContext.mockReturnValue({
            showDebug: false,
        });
    });

    it("renders user message correctly", () => {
        render(<Message id="1" role="user" content="Hello AI" />);

        expect(screen.getByText("user")).toBeInTheDocument();
        expect(screen.getByText("Hello AI")).toBeInTheDocument();
        // Check for specific styling classes for user
        const messageContainer = screen
            .getByText("Hello AI")
            .closest(".message");
        expect(messageContainer).toHaveClass("bg-primary-subtle");
    });

    it("renders assistant message correctly", () => {
        render(<Message id="2" role="assistant" content="Hello User" />);

        expect(screen.getByText("assistant")).toBeInTheDocument();
        expect(screen.getByText("Hello User")).toBeInTheDocument();
        // Check for specific styling classes for assistant
        const messageContainer = screen
            .getByText("Hello User")
            .closest(".message");
        expect(messageContainer).toHaveClass("bg-light-subtle");
    });

    it("renders 'Show Work' button when workspace content is present for assistant", () => {
        const workspace: MessageWorkspaceFragment[] = [
            {
                messageType: "Intermediate", // Matches mocked ResponseType.Intermediate
                timestamp: "123",
                content: "Thinking...",
            },
        ];

        render(
            <Message
                id="3"
                role="assistant"
                content="Final Answer"
                workspace={workspace}
            />
        );

        expect(screen.getByText("Show Work")).toBeInTheDocument();
        // Workspace content should be collapsed initially
        const toggleButton = screen
            .getByText("Show Work")
            .closest("[aria-expanded]");
        expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    });

    it("toggles workspace content when 'Show Work' is clicked", () => {
        const workspace: MessageWorkspaceFragment[] = [
            {
                messageType: "Intermediate",
                timestamp: "123",
                content: "Thinking process",
            },
        ];

        render(
            <Message
                id="3"
                role="assistant"
                content="Final Answer"
                workspace={workspace}
            />
        );

        const toggleButton = screen
            .getByText("Show Work")
            .closest("[aria-expanded]");

        // Initial state: collapsed
        expect(toggleButton).toHaveAttribute("aria-expanded", "false");

        // Click to expand
        fireEvent.click(toggleButton!);
        expect(toggleButton).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByText("Thinking process")).toBeInTheDocument();

        // Click to collapse
        fireEvent.click(toggleButton!);
        expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    });

    it("does not render 'Show Work' button if no workspace content", () => {
        render(
            <Message
                id="4"
                role="assistant"
                content="Just answer"
                workspace={[]}
            />
        );

        expect(screen.queryByText("Show Work")).not.toBeInTheDocument();
    });

    it("shows all workspace items if showDebug is true", () => {
        mockUseUserContext.mockReturnValue({
            showDebug: true,
        });

        const workspace: MessageWorkspaceFragment[] = [
            {
                messageType: "DebugInfo", // Not Intermediate
                timestamp: "123",
                content: "Debug Log",
            },
        ];

        render(
            <Message
                id="5"
                role="assistant"
                content="Answer"
                workspace={workspace}
            />
        );

        // Should show button because showDebug includes all items
        const toggleButton = screen.getByText("Show Work").closest("div");
        fireEvent.click(toggleButton!);

        expect(screen.getByText("Debug Log")).toBeInTheDocument();
    });

    it("filters out non-intermediate items if showDebug is false", () => {
        mockUseUserContext.mockReturnValue({
            showDebug: false,
        });

        const workspace: MessageWorkspaceFragment[] = [
            {
                messageType: "DebugInfo", // Not Intermediate
                timestamp: "123",
                content: "Hidden Debug Log",
            },
            {
                messageType: "Intermediate",
                timestamp: "124",
                content: "Visible Thinking",
            },
        ];

        render(
            <Message
                id="6"
                role="assistant"
                content="Answer"
                workspace={workspace}
            />
        );

        const toggleButton = screen.getByText("Show Work").closest("div");
        fireEvent.click(toggleButton!);

        expect(screen.getByText("Visible Thinking")).toBeInTheDocument();
        expect(screen.queryByText("Hidden Debug Log")).not.toBeInTheDocument();
    });
});
