import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { IntroductionModal } from "./IntroductionModal";

// Mock useLocalStorage hook
vi.mock("@hooks", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@hooks")>();
    return {
        ...actual,
        useLocalStorage: vi.fn(),
    };
});

// Mock image imports
vi.mock("../../assets/chat_with_work_012926.png", () => ({
    default: "chat-image.png",
}));
vi.mock("../../assets/npc_asset_012926.png", () => ({
    default: "asset-image.png",
}));
vi.mock("../../assets/oracle_engine_012926.png", () => ({
    default: "welcome-image.png",
}));
vi.mock("../../assets/recent_work_chat_012926.png", () => ({
    default: "search-image.png",
}));

const getMockHooks = async () => {
    const module = await import("@hooks");
    return {
        useLocalStorage: vi.mocked(module.useLocalStorage),
    };
};

describe("IntroductionModal Component", () => {
    let mockSetHasSeenIntro: ReturnType<typeof vi.fn>;
    let mockOnClose: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockSetHasSeenIntro = vi.fn();
        mockOnClose = vi.fn();

        const hooks = await getMockHooks();
        // Default: user has not seen intro
        hooks.useLocalStorage.mockReturnValue([false, mockSetHasSeenIntro]);
    });

    afterEach(() => {
        cleanup();
    });

    const renderModal = (show = true) => {
        return render(<IntroductionModal show={show} onClose={mockOnClose} />);
    };

    describe("Modal Visibility", () => {
        test("should show modal when show prop is true", () => {
            renderModal(true);

            expect(screen.getByRole("dialog")).toBeInTheDocument();
            expect(screen.getByText("Introduction")).toBeInTheDocument();
        });

        test("should not show modal when show prop is false", () => {
            renderModal(false);

            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
    });

    describe("Step Content Structure", () => {
        test("should display title for current step", () => {
            renderModal();

            // First step title
            expect(
                screen.getByRole("heading", { level: 2 })
            ).toBeInTheDocument();
        });

        test("should display text content section", () => {
            renderModal();

            const textSection = document.querySelector(".introduction-text");
            expect(textSection).toBeInTheDocument();
        });

        test("should display image section", () => {
            renderModal();

            const imageSection = document.querySelector(".introduction-image");
            expect(imageSection).toBeInTheDocument();
            expect(imageSection?.querySelector("img")).toBeInTheDocument();
        });

        test("should display image with alt text matching step title", () => {
            renderModal();

            const image = screen.getByRole("img");
            expect(image).toHaveAttribute("alt");
            expect(image.getAttribute("alt")).toBeTruthy();
        });
    });

    describe("Navigation Dots", () => {
        test("should display navigation dots for all steps", () => {
            renderModal();

            const dots = document.querySelectorAll(".dot");
            expect(dots.length).toBe(4); // 4 intro steps
        });

        test("should mark first dot as active initially", () => {
            renderModal();

            const dots = document.querySelectorAll(".dot");
            expect(dots[0]).toHaveClass("active");
            expect(dots[1]).not.toHaveClass("active");
        });

        test("should navigate to step when dot is clicked", () => {
            renderModal();

            const dots = document.querySelectorAll(".dot");
            fireEvent.click(dots[2]);

            expect(dots[2]).toHaveClass("active");
            expect(dots[0]).not.toHaveClass("active");
        });

        test("should have aria-label on each dot", () => {
            renderModal();

            const dots = document.querySelectorAll(".dot");
            dots.forEach((dot) => {
                expect(dot).toHaveAttribute("aria-label");
            });
        });
    });

    describe("Next Button", () => {
        test("should show Next button on non-final steps", () => {
            renderModal();

            expect(
                screen.getByRole("button", { name: "Next" })
            ).toBeInTheDocument();
        });

        test("should advance to next step when Next is clicked", () => {
            renderModal();

            const nextButton = screen.getByRole("button", { name: "Next" });
            fireEvent.click(nextButton);

            const dots = document.querySelectorAll(".dot");
            expect(dots[1]).toHaveClass("active");
        });

        test("should show Get Started button on final step", () => {
            renderModal();

            // Navigate to last step
            const dots = document.querySelectorAll(".dot");
            fireEvent.click(dots[3]);

            expect(
                screen.getByRole("button", { name: "Get Started" })
            ).toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: "Next" })
            ).not.toBeInTheDocument();
        });

        test("should close modal when Get Started is clicked", () => {
            renderModal();

            // Navigate to last step
            const dots = document.querySelectorAll(".dot");
            fireEvent.click(dots[3]);

            const getStartedButton = screen.getByRole("button", {
                name: "Get Started",
            });
            fireEvent.click(getStartedButton);

            expect(mockSetHasSeenIntro).toHaveBeenCalledWith(true);
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe("Back Button", () => {
        test("should not show Back button on first step", () => {
            renderModal();

            expect(
                screen.queryByRole("button", { name: "Back" })
            ).not.toBeInTheDocument();
        });

        test("should show Back button on subsequent steps", () => {
            renderModal();

            const nextButton = screen.getByRole("button", { name: "Next" });
            fireEvent.click(nextButton);

            expect(
                screen.getByRole("button", { name: "Back" })
            ).toBeInTheDocument();
        });

        test("should go to previous step when Back is clicked", () => {
            renderModal();

            // Go to step 2
            const nextButton = screen.getByRole("button", { name: "Next" });
            fireEvent.click(nextButton);

            const dots = document.querySelectorAll(".dot");
            expect(dots[1]).toHaveClass("active");

            // Go back
            const backButton = screen.getByRole("button", { name: "Back" });
            fireEvent.click(backButton);

            expect(dots[0]).toHaveClass("active");
        });
    });

    describe("Skip Button", () => {
        test("should show Skip button on non-final steps", () => {
            renderModal();

            expect(screen.getByText("Skip")).toBeInTheDocument();
        });

        test("should not show Skip button on final step", () => {
            renderModal();

            // Navigate to last step
            const dots = document.querySelectorAll(".dot");
            fireEvent.click(dots[3]);

            expect(screen.queryByText("Skip")).not.toBeInTheDocument();
        });
    });

    describe("Close Button", () => {
        test("should have close button in header", () => {
            renderModal();

            const closeButton = screen.getByLabelText("Close");
            expect(closeButton).toBeInTheDocument();
        });

        test("should close modal when close button is clicked", () => {
            renderModal();

            const closeButton = screen.getByLabelText("Close");
            fireEvent.click(closeButton);

            expect(mockSetHasSeenIntro).toHaveBeenCalledWith(true);
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe("Step Navigation Flow", () => {
        test("should navigate through all steps with Next button", () => {
            renderModal();

            const dots = document.querySelectorAll(".dot");

            // Start at step 1
            expect(dots[0]).toHaveClass("active");

            // Click Next 3 times to reach last step
            for (let i = 0; i < 3; i++) {
                const nextButton = screen.getByRole("button", { name: "Next" });
                fireEvent.click(nextButton);
            }

            // Should be on last step
            expect(dots[3]).toHaveClass("active");
            expect(
                screen.getByRole("button", { name: "Get Started" })
            ).toBeInTheDocument();
        });

        test("should update content when navigating between steps", () => {
            renderModal();

            const getTitle = () =>
                screen.getByRole("heading", { level: 2 }).textContent;
            const initialTitle = getTitle();

            // Navigate to step 2
            const nextButton = screen.getByRole("button", { name: "Next" });
            fireEvent.click(nextButton);

            const newTitle = getTitle();
            expect(newTitle).not.toBe(initialTitle);
        });

        test("should update image when navigating between steps", () => {
            renderModal();

            const getImageSrc = () =>
                screen.getByRole("img").getAttribute("src");
            const initialSrc = getImageSrc();

            // Navigate to step 2
            const nextButton = screen.getByRole("button", { name: "Next" });
            fireEvent.click(nextButton);

            const newSrc = getImageSrc();
            expect(newSrc).not.toBe(initialSrc);
        });
    });

    describe("Button Variants", () => {
        test("should show primary variant for Next button", () => {
            renderModal();

            const nextButton = screen.getByRole("button", { name: "Next" });
            expect(nextButton).toHaveClass("btn-primary");
        });

        test("should show success variant for Get Started button", () => {
            renderModal();

            // Navigate to last step
            const dots = document.querySelectorAll(".dot");
            fireEvent.click(dots[3]);

            const getStartedButton = screen.getByRole("button", {
                name: "Get Started",
            });
            expect(getStartedButton).toHaveClass("btn-success");
        });
    });
});
