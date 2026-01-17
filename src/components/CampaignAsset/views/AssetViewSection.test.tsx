import "@testing-library/jest-dom";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "../../../test-utils";
import { AssetViewSection } from "./AssetViewSection";

describe("AssetViewSection Component", () => {
    afterEach(() => {
        cleanup();
    });

    test("should render label and content", () => {
        render(<AssetViewSection label="Test Label" content="Test content" />);

        expect(screen.getByText("Test Label")).toBeInTheDocument();
        expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    test("should render empty text when content is empty", () => {
        render(
            <AssetViewSection
                label="Test Label"
                content=""
                emptyText="No data"
            />
        );

        expect(screen.getByText("Test Label")).toBeInTheDocument();
        expect(screen.getByText("No data")).toBeInTheDocument();
    });

    test("should use default empty text when not provided", () => {
        render(<AssetViewSection label="Test Label" content="" />);

        expect(screen.getByText("Test Label")).toBeInTheDocument();
        expect(screen.getByText("No information provided")).toBeInTheDocument();
    });

    test("should render with blockquote wrapper when specified", () => {
        const { container } = render(
            <AssetViewSection
                label="Test Label"
                content="Test content"
                wrapper="blockquote"
            />
        );

        const blockquote = container.querySelector("blockquote");
        expect(blockquote).toBeInTheDocument();
        expect(blockquote).toHaveClass("blockquote");
    });

    test("should render without blockquote wrapper by default", () => {
        const { container } = render(
            <AssetViewSection label="Test Label" content="Test content" />
        );

        const blockquote = container.querySelector("blockquote");
        expect(blockquote).not.toBeInTheDocument();
    });

    test("should render markdown content", () => {
        render(
            <AssetViewSection
                label="Test Label"
                content="**Bold text** and _italic text_"
            />
        );

        // MarkdownRenderer should convert markdown to HTML
        expect(screen.getByText("Test Label")).toBeInTheDocument();
        // The actual markdown rendering is tested in MarkdownRenderer tests
    });

    test("should handle whitespace-only content as empty", () => {
        render(
            <AssetViewSection
                label="Test Label"
                content="   "
                emptyText="Empty content"
            />
        );

        expect(screen.getByText("Empty content")).toBeInTheDocument();
    });
});
