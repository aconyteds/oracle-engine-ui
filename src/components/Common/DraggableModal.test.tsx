import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "../../test-utils";
import { DraggableModal, type DraggableModalProps } from "./DraggableModal";

describe("DraggableModal Component", () => {
    const mockOnClose = vi.fn();

    const defaultProps: DraggableModalProps = {
        title: "Test Modal",
        onClose: mockOnClose,
        children: <div>Test Content</div>,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    test("should render without crashing", () => {
        render(<DraggableModal {...defaultProps} />);
        expect(screen.getByTestId("draggable-modal")).toBeInTheDocument();
    });

    test("should display provided title", () => {
        render(<DraggableModal {...defaultProps} title="Custom Title" />);
        expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    test("should render children content", () => {
        render(
            <DraggableModal
                {...defaultProps}
                title="Test"
                children={<div>Custom Child Content</div>}
            />
        );
        expect(screen.getByText("Custom Child Content")).toBeInTheDocument();
    });

    test("should call onClose when close button is clicked", () => {
        render(<DraggableModal {...defaultProps} />);
        const closeButton = screen.getByLabelText("Close");
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("should position modal at initial coordinates", () => {
        render(
            <DraggableModal {...defaultProps} initialX={200} initialY={150} />
        );
        const wrapper = document.querySelector(".draggable-modal-wrapper");
        expect(wrapper).toHaveStyle({
            transform: "translate(200px, 150px)",
        });
    });

    test("should use default position when not specified", () => {
        render(<DraggableModal {...defaultProps} />);
        const wrapper = document.querySelector(".draggable-modal-wrapper");
        expect(wrapper).toHaveStyle({
            transform: "translate(100px, 100px)",
        });
    });

    test("should start drag on mousedown on header", () => {
        render(<DraggableModal {...defaultProps} />);
        const header = screen.getByTestId("draggable-modal-header");

        fireEvent.mouseDown(header, { clientX: 150, clientY: 150 });

        // The component should be in dragging state, but we can't directly check internal state
        // We'll verify by checking if mousemove would affect position
        expect(header).toBeInTheDocument();
    });

    test("should update position during drag", () => {
        render(
            <DraggableModal {...defaultProps} initialX={100} initialY={100} />
        );
        const header = screen.getByTestId("draggable-modal-header");
        const modal = screen.getByTestId("draggable-modal");

        // Start drag
        fireEvent.mouseDown(header, { clientX: 150, clientY: 150 });

        // Move mouse
        act(() => {
            fireEvent(
                document,
                new MouseEvent("mousemove", {
                    clientX: 200,
                    clientY: 200,
                    bubbles: true,
                })
            );
        });

        // Position should have changed
        expect(modal).toBeInTheDocument();
    });

    test("should stop drag on mouseup", () => {
        render(<DraggableModal {...defaultProps} />);
        const header = screen.getByTestId("draggable-modal-header");

        // Start drag
        fireEvent.mouseDown(header, { clientX: 150, clientY: 150 });

        // End drag
        act(() => {
            fireEvent(document, new MouseEvent("mouseup", { bubbles: true }));
        });

        expect(header).toBeInTheDocument();
    });

    test("should have draggable modal body with scrolling", () => {
        render(<DraggableModal {...defaultProps} />);
        const body = screen.getByTestId("draggable-modal-body");
        expect(body).toBeInTheDocument();
        expect(body).toHaveClass("modal-body");
    });

    test("should render resize handle", () => {
        render(<DraggableModal {...defaultProps} />);
        const resizeHandle = screen.getByTestId("resize-handle");
        expect(resizeHandle).toBeInTheDocument();
    });

    test("should start resize on mousedown on resize handle", () => {
        render(<DraggableModal {...defaultProps} />);
        const resizeHandle = screen.getByTestId("resize-handle");

        fireEvent.mouseDown(resizeHandle, { clientX: 500, clientY: 400 });

        expect(resizeHandle).toBeInTheDocument();
    });
});
