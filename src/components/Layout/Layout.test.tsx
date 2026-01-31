import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "../../test-utils";
import { Layout } from "./Layout";

// Mock child components to simplify testing
vi.mock("../Campaign", () => ({
    CampaignModal: () => <div data-testid="campaign-modal">CampaignModal</div>,
}));

vi.mock("../Common", () => ({
    ResizablePanel: ({
        children,
        leftPanel,
    }: {
        children: React.ReactNode;
        leftPanel: React.ReactNode;
    }) => (
        <div data-testid="resizable-panel">
            <div data-testid="left-panel">{leftPanel}</div>
            <div data-testid="right-panel">{children}</div>
        </div>
    ),
}));

vi.mock("../HealthCheck", () => ({
    HealthCheck: () => <div data-testid="health-check">HealthCheck</div>,
}));

vi.mock("../Introduction", () => ({
    INTRO_MODAL_FLAG: "hasSeenIntroduction",
}));

vi.mock("../Introduction/IntroductionModal", () => ({
    IntroductionModal: ({ show }: { show: boolean; onClose: () => void }) =>
        show ? (
            <div data-testid="introduction-modal">IntroductionModal</div>
        ) : null,
}));

vi.mock("../UsageIndicator", () => ({
    UsageIndicator: () => (
        <div data-testid="usage-indicator">UsageIndicator</div>
    ),
}));

vi.mock("./ChatPanel", () => ({
    ChatPanel: () => <div data-testid="chat-panel">ChatPanel</div>,
}));

vi.mock("./Header", () => ({
    Header: ({ onShowIntro: _ }: { onShowIntro: () => void }) => (
        <div data-testid="header">Header</div>
    ),
}));

vi.mock("./Main", () => ({
    Main: () => <div data-testid="main">Main</div>,
}));

describe("Layout Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe("Container Structure", () => {
        test("should render root container", () => {
            const { container } = render(<Layout />);

            expect(
                container.querySelector(".root-container")
            ).toBeInTheDocument();
        });

        test("should render header container", () => {
            const { container } = render(<Layout />);

            expect(
                container.querySelector(".header-container")
            ).toBeInTheDocument();
        });

        test("should render content container", () => {
            const { container } = render(<Layout />);

            expect(
                container.querySelector(".content-container")
            ).toBeInTheDocument();
        });
    });

    describe("Header Section", () => {
        test("should render Header component", () => {
            render(<Layout />);

            expect(screen.getByTestId("header")).toBeInTheDocument();
        });
    });

    describe("Main Content Area", () => {
        test("should render ResizablePanel", () => {
            render(<Layout />);

            expect(screen.getByTestId("resizable-panel")).toBeInTheDocument();
        });

        test("should render ChatPanel in left panel", () => {
            render(<Layout />);

            const leftPanel = screen.getByTestId("left-panel");
            expect(leftPanel).toContainElement(
                screen.getByTestId("chat-panel")
            );
        });

        test("should render Main component in right panel", () => {
            render(<Layout />);

            const rightPanel = screen.getByTestId("right-panel");
            expect(rightPanel).toContainElement(screen.getByTestId("main"));
        });
    });

    describe("Chat Panel Footer", () => {
        test("should render HealthCheck component", () => {
            render(<Layout />);

            expect(screen.getByTestId("health-check")).toBeInTheDocument();
        });

        test("should render UsageIndicator component", () => {
            render(<Layout />);

            expect(screen.getByTestId("usage-indicator")).toBeInTheDocument();
        });

        test("should render chat panel footer container", () => {
            const { container } = render(<Layout />);

            expect(
                container.querySelector(".chat-panel-footer")
            ).toBeInTheDocument();
        });
    });

    describe("Modals", () => {
        test("should render CampaignModal", () => {
            render(<Layout />);

            expect(screen.getByTestId("campaign-modal")).toBeInTheDocument();
        });

        test("should render IntroductionModal", async () => {
            render(<Layout />);

            expect(
                await screen.findByTestId("introduction-modal")
            ).toBeInTheDocument();
        });
    });

    describe("Component Hierarchy", () => {
        test("should have proper nesting structure", () => {
            const { container } = render(<Layout />);

            const rootContainer = container.querySelector(".root-container");
            const headerContainer =
                container.querySelector(".header-container");
            const contentContainer =
                container.querySelector(".content-container");

            expect(rootContainer).toContainElement(
                headerContainer as HTMLElement
            );
            expect(rootContainer).toContainElement(
                contentContainer as HTMLElement
            );
        });
    });
});
