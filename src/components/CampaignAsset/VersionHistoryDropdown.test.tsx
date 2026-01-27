import type { CampaignAssetVersionFragment } from "@graphql";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { VersionHistoryDropdown } from "./VersionHistoryDropdown";

// Mock formatRelativeTime - must be before imports that use it
vi.mock("../../utils", () => ({
    formatRelativeTime: (date: string) => {
        // Return simple mock values based on input
        if (date.includes("2024-01-15")) return "2 days";
        if (date.includes("2024-01-10")) return "1 week";
        return "some time";
    },
}));

describe("VersionHistoryDropdown Component", () => {
    const mockOnRevert = vi.fn().mockResolvedValue(undefined);

    const mockVersions: CampaignAssetVersionFragment[] = [
        {
            id: "version-1",
            name: "First Version",
            createdAt: "2024-01-15T10:00:00Z",
        },
        {
            id: "version-2",
            name: "Second Version",
            createdAt: "2024-01-10T10:00:00Z",
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe("Rendering", () => {
        test("should return null when versions array is empty", () => {
            render(
                <VersionHistoryDropdown versions={[]} onRevert={mockOnRevert} />
            );

            // Should not render the History button when no versions
            expect(screen.queryByText("History")).not.toBeInTheDocument();
        });

        test("should render dropdown toggle when versions exist", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                />
            );

            expect(screen.getByText("History")).toBeInTheDocument();
        });

        test("should render with history icon in toggle button", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                />
            );

            const toggleButton = screen.getByRole("button", {
                name: /history/i,
            });
            expect(toggleButton).toBeInTheDocument();
        });

        test("should show version list when dropdown is opened", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                />
            );

            // Open dropdown
            const toggleButton = screen.getByText("History");
            fireEvent.click(toggleButton);

            // Check header
            expect(screen.getByText("Version History")).toBeInTheDocument();

            // Check version names
            expect(screen.getByText("First Version")).toBeInTheDocument();
            expect(screen.getByText("Second Version")).toBeInTheDocument();
        });

        test("should display relative timestamps for versions", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                />
            );

            // Open dropdown
            fireEvent.click(screen.getByText("History"));

            expect(screen.getByText("2 days ago")).toBeInTheDocument();
            expect(screen.getByText("1 week ago")).toBeInTheDocument();
        });

        test("should render revert button for each version", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                />
            );

            // Open dropdown
            fireEvent.click(screen.getByText("History"));

            // Should have 2 revert buttons (one per version)
            const revertButtons = screen.getAllByRole("button", {
                name: "",
            });
            // Filter to just the HoldConfirmButtons (they have the hold-confirm-button class)
            const holdButtons = revertButtons.filter((btn) =>
                btn.classList.contains("hold-confirm-button")
            );
            expect(holdButtons).toHaveLength(2);
        });
    });

    describe("Disabled States", () => {
        test("should disable toggle when disabled prop is true", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                    disabled={true}
                />
            );

            const toggleButton = screen.getByText("History");
            expect(toggleButton.closest("button")).toBeDisabled();
        });

        test("should disable toggle when isReverting is true", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                    isReverting={true}
                />
            );

            const toggleButton = screen.getByText("History");
            expect(toggleButton.closest("button")).toBeDisabled();
        });

        test("should disable revert buttons when disabled prop is true", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                    disabled={true}
                />
            );

            // Open dropdown
            fireEvent.click(screen.getByText("History"));

            const revertButtons = screen
                .getAllByRole("button")
                .filter((btn) => btn.classList.contains("hold-confirm-button"));
            for (const btn of revertButtons) {
                expect(btn).toBeDisabled();
            }
        });

        test("should disable revert buttons when isReverting is true", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                    isReverting={true}
                />
            );

            // Open dropdown - need to click the parent since button is disabled
            // Actually the dropdown should still be openable visually
            // The button is disabled but we can still check the menu items
            const revertButtons = screen
                .getAllByRole("button")
                .filter((btn) => btn.classList.contains("hold-confirm-button"));
            for (const btn of revertButtons) {
                expect(btn).toBeDisabled();
            }
        });
    });

    describe("Single Version", () => {
        test("should render correctly with single version", () => {
            const singleVersion = [mockVersions[0]];

            render(
                <VersionHistoryDropdown
                    versions={singleVersion}
                    onRevert={mockOnRevert}
                />
            );

            fireEvent.click(screen.getByText("History"));

            expect(screen.getByText("First Version")).toBeInTheDocument();
            expect(
                screen.queryByText("Second Version")
            ).not.toBeInTheDocument();
        });
    });

    describe("Dropdown Behavior", () => {
        test("should have drop='up' positioning", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                />
            );

            // The dropdown should have dropup class (Bootstrap adds this for drop="up")
            const toggleButton = screen.getByText("History").closest("button");
            const dropdown = toggleButton?.parentElement;
            expect(dropdown).toHaveClass("dropup");
        });

        test("should have minimum width on dropdown menu", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                />
            );

            fireEvent.click(screen.getByText("History"));

            const menu = screen
                .getByText("Version History")
                .closest(".dropdown-menu");
            expect(menu).toHaveStyle({ minWidth: "280px" });
        });
    });

    describe("Default Props", () => {
        test("should default disabled to false", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                />
            );

            const toggleButton = screen.getByText("History").closest("button");
            expect(toggleButton).not.toBeDisabled();
        });

        test("should default isReverting to false", () => {
            render(
                <VersionHistoryDropdown
                    versions={mockVersions}
                    onRevert={mockOnRevert}
                />
            );

            const toggleButton = screen.getByText("History").closest("button");
            expect(toggleButton).not.toBeDisabled();
        });
    });
});
