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
        const validId = "507f1f77bcf86cd799439011";

        test.each([
            ["Plot", RecordType.Plot, "Test Plot Link"],
            ["NPC", RecordType.Npc, "Test NPC Link"],
            ["Location", RecordType.Location, "Test Location Link"],
        ])(
            "should recognize valid asset link format with %s type",
            (typeName, expectedRecordType, linkText) => {
                render(
                    <AssetLink href={`${typeName}:${validId}`}>
                        {linkText}
                    </AssetLink>
                );

                const link = screen.getByText(linkText);
                fireEvent.click(link);

                expect(mockOpenModal).toHaveBeenCalledWith(
                    expectedRecordType,
                    validId,
                    linkText
                );
            }
        );

        test("should handle URL-encoded colons in asset links", () => {
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

        test.each([
            ["too short ID", "Plot:123", "Plot:123"],
            [
                "non-hex characters",
                "Plot:507f1f77bcf86cd79943901g",
                "Plot:507f1f77bcf86cd79943901g",
            ],
            [
                "invalid asset type",
                `InvalidType:${validId}`,
                `InvalidType:${validId}`,
            ],
            ["no colon separator", "NoColonHere", "NoColonHere"],
        ])("should reject invalid link format: %s", (_, href, expectedHref) => {
            render(<AssetLink href={href}>Invalid Link</AssetLink>);

            const link = screen.getByText("Invalid Link");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", expectedHref);
        });
    });

    describe("Asset Type Resolution", () => {
        const validId = "507f1f77bcf86cd799439011";

        test.each([
            ["Plot (exact case)", "Plot", RecordType.Plot],
            ["npc (lowercase)", "npc", RecordType.Npc],
            ["location (lowercase)", "location", RecordType.Location],
            ["pLoT (mixed case)", "pLoT", RecordType.Plot],
            ["NPC (uppercase)", "NPC", RecordType.Npc],
            ["LOCATION (uppercase)", "LOCATION", RecordType.Location],
        ])(
            "should match %s type case-insensitively",
            (_, typeName, expectedRecordType) => {
                const linkText = `${typeName} Link`;
                render(
                    <AssetLink href={`${typeName}:${validId}`}>
                        {linkText}
                    </AssetLink>
                );

                const link = screen.getByText(linkText);
                fireEvent.click(link);

                expect(mockOpenModal).toHaveBeenCalledWith(
                    expectedRecordType,
                    validId,
                    linkText
                );
            }
        );
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
        const validId = "507f1f77bcf86cd799439011";

        test.each([
            ["Enter", "Enter", "Enter Key Link"],
            ["Space", " ", "Space Key Link"],
        ])("should open modal on %s key press", (_, key, linkText) => {
            render(<AssetLink href={`Plot:${validId}`}>{linkText}</AssetLink>);

            const link = screen.getByText(linkText);
            fireEvent.keyDown(link, { key });

            expect(mockOpenModal).toHaveBeenCalledWith(
                RecordType.Plot,
                validId,
                linkText
            );
        });

        test.each([["Tab"], ["Escape"], ["a"]])(
            "should not open modal on %s key press",
            (key) => {
                render(
                    <AssetLink href={`Plot:${validId}`}>Key Test</AssetLink>
                );

                const link = screen.getByText("Key Test");
                fireEvent.keyDown(link, { key });

                expect(mockOpenModal).not.toHaveBeenCalled();
            }
        );

        test("should prevent default behavior on Enter key", () => {
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
        test.each([
            [
                "HTTP URL",
                "https://example.com",
                { target: "_blank", rel: "noopener noreferrer" },
            ],
            ["relative URL", "/relative/path", {}],
            ["mailto link", "mailto:test@example.com", {}],
        ])("should render regular anchor for %s", (_, href, expectedAttrs) => {
            render(<AssetLink href={href}>Test Link</AssetLink>);

            const link = screen.getByText("Test Link");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", href);
            for (const [attr, value] of Object.entries(expectedAttrs)) {
                expect(link).toHaveAttribute(attr, value);
            }
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

        test.each([
            ["23-character ID", "abcdef1234567890abcdef1"],
            ["25-character ID", "abcdef1234567890abcdef123"],
            ["uppercase hex", "ABCDEF1234567890ABCDEF12"],
            ["mixed case hex", "AbCdEf1234567890aBcDeF12"],
        ])("should reject %s", (_, invalidId) => {
            render(
                <AssetLink href={`Plot:${invalidId}`}>Invalid Link</AssetLink>
            );

            const link = screen.getByText("Invalid Link");
            expect(link.tagName).toBe("A");
            expect(link).toHaveAttribute("href", `Plot:${invalidId}`);
        });

        test("should handle multiple colons in href", () => {
            render(<AssetLink href="Plot:123:456">Multiple Colons</AssetLink>);

            const link = screen.getByText("Multiple Colons");
            expect(link.tagName).toBe("A");
        });
    });
});
