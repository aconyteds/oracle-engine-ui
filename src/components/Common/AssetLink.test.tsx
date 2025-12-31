import { RecordType } from "@graphql";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { assetModalManager } from "../../signals/campaignAssetModals";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { AssetLink } from "./AssetLink";

// Mock the assetModalManager
vi.mock("../../signals/campaignAssetModals", () => ({
    assetModalManager: {
        openModal: vi.fn(),
    },
}));

describe("AssetLink Component", () => {
    const mockOpenModal = vi.mocked(assetModalManager.openModal);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe("Asset Link Pattern Matching", () => {
        test("should recognize valid asset link format with Plot type", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`Plot:${validId}`}>Test Plot Link</AssetLink>
            );

            const link = screen.getByText("Test Plot Link");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Plot,
                validId,
                "Test Plot Link"
            );
        });

        test("should recognize valid asset link format with NPC type", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`NPC:${validId}`}>Test NPC Link</AssetLink>
            );

            const link = screen.getByText("Test NPC Link");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Npc,
                validId,
                "Test NPC Link"
            );
        });

        test("should recognize valid asset link format with Location type", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`Location:${validId}`}>
                    Test Location Link
                </AssetLink>
            );

            const link = screen.getByText("Test Location Link");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Location,
                validId,
                "Test Location Link"
            );
        });

        test("should handle URL-encoded colons in asset links", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`Plot%3A${validId}`}>
                    Encoded Plot Link
                </AssetLink>
            );

            const link = screen.getByText("Encoded Plot Link");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Plot,
                validId,
                "Encoded Plot Link"
            );
        });

        test("should reject invalid ID format (too short)", () => {
            render(<AssetLink href="Plot:123">Invalid Short ID</AssetLink>);

            const link = screen.getByText("Invalid Short ID");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", "Plot:123");
        });

        test("should reject invalid ID format (non-hex characters)", () => {
            const invalidId = "507f1f77bcf86cd79943901g"; // 'g' is not hex
            render(
                <AssetLink href={`Plot:${invalidId}`}>Invalid Hex ID</AssetLink>
            );

            const link = screen.getByText("Invalid Hex ID");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", `Plot:${invalidId}`);
        });

        test("should reject invalid asset type", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`InvalidType:${validId}`}>
                    Invalid Type
                </AssetLink>
            );

            const link = screen.getByText("Invalid Type");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", `InvalidType:${validId}`);
        });

        test("should reject links without colon separator", () => {
            render(<AssetLink href="NoColonHere">No Colon</AssetLink>);

            const link = screen.getByText("No Colon");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", "NoColonHere");
        });
    });

    describe("Asset Type Resolution", () => {
        test("should match Plot type case-sensitively", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`Plot:${validId}`}>Case Sensitive</AssetLink>
            );

            const link = screen.getByText("Case Sensitive");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Plot,
                validId,
                "Case Sensitive"
            );
        });

        test("should match NPC type case-insensitively (lowercase)", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`npc:${validId}`}>
                    Lowercase NPC Link
                </AssetLink>
            );

            const link = screen.getByText("Lowercase NPC Link");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Npc,
                validId,
                "Lowercase NPC Link"
            );
        });

        test("should match Location type case-insensitively (lowercase)", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`location:${validId}`}>
                    Lowercase Location
                </AssetLink>
            );

            const link = screen.getByText("Lowercase Location");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Location,
                validId,
                "Lowercase Location"
            );
        });

        test("should match Plot type case-insensitively (mixed case)", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`pLoT:${validId}`}>Mixed Case Plot</AssetLink>
            );

            const link = screen.getByText("Mixed Case Plot");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Plot,
                validId,
                "Mixed Case Plot"
            );
        });
    });

    describe("Modal Opening Behavior", () => {
        test("should call assetModalManager.openModal with correct parameters", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(<AssetLink href={`Plot:${validId}`}>Plot Name</AssetLink>);

            const link = screen.getByText("Plot Name");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledTimes(1);
            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Plot,
                validId,
                "Plot Name"
            );
        });

        test("should prevent default click behavior for asset links", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(<AssetLink href={`Plot:${validId}`}>Test Link</AssetLink>);

            const link = screen.getByText("Test Link");
            const clickEvent = new MouseEvent("click", { bubbles: true });
            const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");

            link.dispatchEvent(clickEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        test("should stop event propagation for asset links", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(<AssetLink href={`Plot:${validId}`}>Test Link</AssetLink>);

            const link = screen.getByText("Test Link");
            const clickEvent = new MouseEvent("click", { bubbles: true });
            const stopPropagationSpy = vi.spyOn(clickEvent, "stopPropagation");

            link.dispatchEvent(clickEvent);

            expect(stopPropagationSpy).toHaveBeenCalled();
        });

        test("should render as span with proper styling for asset links", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(<AssetLink href={`Plot:${validId}`}>Styled Link</AssetLink>);

            const link = screen.getByText("Styled Link");
            expect(link.tagName).toBe("SPAN");
            expect(link).toHaveClass("text-primary");
            expect(link).toHaveClass("text-decoration-underline");
            expect(link).toHaveStyle({ cursor: "pointer" });
        });

        test("should have role=button for asset links", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`Plot:${validId}`}>Accessible Link</AssetLink>
            );

            const link = screen.getByRole("button");
            expect(link).toBeInTheDocument();
            expect(link).toHaveTextContent("Accessible Link");
        });

        test("should have tabIndex=0 for keyboard accessibility", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`Plot:${validId}`}>Keyboard Link</AssetLink>
            );

            const link = screen.getByText("Keyboard Link");
            expect(link).toHaveAttribute("tabIndex", "0");
        });
    });

    describe("Keyboard Navigation", () => {
        test("should open modal on Enter key press", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`Plot:${validId}`}>Keyboard Plot</AssetLink>
            );

            const link = screen.getByText("Keyboard Plot");
            fireEvent.keyDown(link, { key: "Enter" });

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Plot,
                validId,
                "Keyboard Plot"
            );
        });

        test("should open modal on Space key press", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`Plot:${validId}`}>Space Key Plot</AssetLink>
            );

            const link = screen.getByText("Space Key Plot");
            fireEvent.keyDown(link, { key: " " });

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Plot,
                validId,
                "Space Key Plot"
            );
        });

        test("should not open modal on other key presses", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`Plot:${validId}`}>Other Key Plot</AssetLink>
            );

            const link = screen.getByText("Other Key Plot");
            fireEvent.keyDown(link, { key: "Tab" });
            fireEvent.keyDown(link, { key: "Escape" });
            fireEvent.keyDown(link, { key: "a" });

            expect(mockOpenModal).not.toHaveBeenCalled();
        });

        test("should prevent default behavior on Enter key", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(<AssetLink href={`Plot:${validId}`}>Enter Key</AssetLink>);

            const link = screen.getByText("Enter Key");
            const keyEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
            });
            const preventDefaultSpy = vi.spyOn(keyEvent, "preventDefault");

            link.dispatchEvent(keyEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        test("should stop propagation on Space key", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(<AssetLink href={`Plot:${validId}`}>Space Key</AssetLink>);

            const link = screen.getByText("Space Key");
            const keyEvent = new KeyboardEvent("keydown", {
                key: " ",
                bubbles: true,
            });
            const stopPropagationSpy = vi.spyOn(keyEvent, "stopPropagation");

            link.dispatchEvent(keyEvent);

            expect(stopPropagationSpy).toHaveBeenCalled();
        });
    });

    describe("Fallback to Regular Anchor Links", () => {
        test("should render regular anchor for HTTP URLs", () => {
            render(
                <AssetLink href="https://example.com">External Link</AssetLink>
            );

            const link = screen.getByText("External Link");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", "https://example.com");
            expect(link).toHaveAttribute("target", "_blank");
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
        });

        test("should render regular anchor for relative URLs", () => {
            render(<AssetLink href="/relative/path">Relative Link</AssetLink>);

            const link = screen.getByText("Relative Link");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", "/relative/path");
        });

        test("should render regular anchor for mailto links", () => {
            render(
                <AssetLink href="mailto:test@example.com">Email Link</AssetLink>
            );

            const link = screen.getByText("Email Link");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", "mailto:test@example.com");
        });

        test("should not call openModal for regular links", () => {
            render(
                <AssetLink href="https://example.com">Regular Link</AssetLink>
            );

            const link = screen.getByText("Regular Link");
            fireEvent.click(link);

            expect(mockOpenModal).not.toHaveBeenCalled();
        });

        test("should pass through additional anchor attributes", () => {
            render(
                <AssetLink href="https://example.com" className="custom-class">
                    Custom Link
                </AssetLink>
            );

            const link = screen.getByText("Custom Link");
            expect(link).toHaveClass("custom-class");
        });

        test("should render anchor when href is undefined", () => {
            render(<AssetLink>No Href Link</AssetLink>);

            const link = screen.getByText("No Href Link");
            expect(link.tagName).toBe("A");
        });
    });

    describe("Error Handling", () => {
        test("should handle errors gracefully and fallback to anchor", () => {
            // Spy on console.error to check if error is logged
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {
                    // Suppress console error for this test
                });

            // Mock decodeURIComponent to throw an error
            const originalDecode = global.decodeURIComponent;
            global.decodeURIComponent = vi.fn(() => {
                throw new Error("Decode error");
            });

            render(
                <AssetLink href="Plot:507f1f77bcf86cd799439011">
                    Error Link
                </AssetLink>
            );

            const link = screen.getByText("Error Link");
            expect(link.tagName).toBe("A");
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Error parsing markdown link:",
                expect.any(Error)
            );

            // Restore original function
            global.decodeURIComponent = originalDecode;
            consoleErrorSpy.mockRestore();
        });

        test("should trim whitespace from href before matching", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`  Plot:${validId}  `}>
                    Whitespace Link
                </AssetLink>
            );

            const link = screen.getByText("Whitespace Link");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Plot,
                validId,
                "Whitespace Link"
            );
        });

        test("should handle children as empty string when undefined", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(<AssetLink href={`Plot:${validId}`} />);

            const link = screen.getByRole("button");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Plot,
                validId,
                ""
            );
        });

        test("should convert non-string children to string", () => {
            const validId = "507f1f77bcf86cd799439011";
            render(
                <AssetLink href={`Plot:${validId}`}>
                    <div>Complex Child</div>
                </AssetLink>
            );

            const link = screen.getByRole("button");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Plot,
                validId,
                expect.any(String)
            );
        });
    });

    describe("Edge Cases", () => {
        test("should handle 24-character hex IDs correctly", () => {
            const validId = "abcdef1234567890abcdef12";
            render(<AssetLink href={`Plot:${validId}`}>Hex ID</AssetLink>);

            const link = screen.getByText("Hex ID");
            fireEvent.click(link);

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Plot,
                validId,
                "Hex ID"
            );
        });

        test("should reject 23-character IDs", () => {
            const invalidId = "abcdef1234567890abcdef1"; // 23 chars
            render(
                <AssetLink href={`Plot:${invalidId}`}>Short ID Link</AssetLink>
            );

            const link = screen.getByText("Short ID Link");
            expect(link.tagName).toBe("A");
        });

        test("should reject 25-character IDs", () => {
            const invalidId = "abcdef1234567890abcdef123"; // 25 chars
            render(
                <AssetLink href={`Plot:${invalidId}`}>Long ID Link</AssetLink>
            );

            const link = screen.getByText("Long ID Link");
            expect(link.tagName).toBe("A");
        });

        test("should handle multiple colons in href", () => {
            render(<AssetLink href="Plot:123:456">Multiple Colons</AssetLink>);

            const link = screen.getByText("Multiple Colons");
            expect(link.tagName).toBe("A");
        });

        test("should reject uppercase hex characters in ID", () => {
            const invalidId = "ABCDEF1234567890ABCDEF12";
            render(
                <AssetLink href={`Plot:${invalidId}`}>Uppercase Hex</AssetLink>
            );

            const link = screen.getByText("Uppercase Hex");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", `Plot:${invalidId}`);
        });

        test("should reject mixed case hex characters in ID", () => {
            const invalidId = "AbCdEf1234567890aBcDeF12";
            render(
                <AssetLink href={`Plot:${invalidId}`}>Mixed Hex Case</AssetLink>
            );

            const link = screen.getByText("Mixed Hex Case");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", `Plot:${invalidId}`);
        });
    });
});
