import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAutoGrowTextarea } from "./useAutoGrowTextarea";

describe("useAutoGrowTextarea", () => {
    it("should return a ref object", () => {
        const TestComponent = () => {
            const textareaRef = useAutoGrowTextarea("test content", 2);
            return <textarea ref={textareaRef} />;
        };

        const { container } = render(<TestComponent />);
        const textarea = container.querySelector("textarea");
        expect(textarea).toBeTruthy();
    });

    it("should apply auto height to textarea", () => {
        const TestComponent = () => {
            const textareaRef = useAutoGrowTextarea("test content", 2);
            return <textarea ref={textareaRef} defaultValue="test content" />;
        };

        const { container } = render(<TestComponent />);
        const textarea = container.querySelector("textarea");
        expect(textarea?.style.height).toBeTruthy();
    });
});
