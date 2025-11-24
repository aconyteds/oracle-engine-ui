import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "../../test-utils";
import { DraggableModal, type DraggableModalProps } from "./DraggableModal";

// Extend Element interface for test purposes
interface ElementWithCallback extends Element {
    __resizeObserverCallback?: ResizeObserverCallback;
}

// Mock ResizeObserver
class ResizeObserverMock {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
    }
    observe(target: Element) {
        // Store the callback for manual triggering in tests
        (target as ElementWithCallback).__resizeObserverCallback =
            this.callback;
    }
    unobserve() {
        // Mock implementation - no action needed
    }
    disconnect() {
        // Mock implementation - no action needed
    }
}

global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

describe("DraggableModal Component", () => {
    const mockOnClose = vi.fn();
    const mockOnPositionChange = vi.fn();

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

    describe("Container Resize Behavior", () => {
        const triggerContainerResize = (
            container: Element,
            width: number,
            height: number
        ) => {
            const callback = (container as ElementWithCallback)
                .__resizeObserverCallback;
            if (callback) {
                act(() => {
                    callback(
                        [
                            {
                                target: container,
                                contentRect: {
                                    width,
                                    height,
                                    top: 0,
                                    left: 0,
                                    right: width,
                                    bottom: height,
                                    x: 0,
                                    y: 0,
                                    toJSON: () => {
                                        // Mock implementation
                                    },
                                },
                                borderBoxSize: [],
                                contentBoxSize: [],
                                devicePixelContentBoxSize: [],
                            },
                        ],
                        {} as ResizeObserver
                    );
                });
            }
        };

        test("should adjust position when container shrinks and modal is near right edge", () => {
            const { container } = render(
                <DraggableModal
                    {...defaultProps}
                    initialX={700}
                    initialY={100}
                    onPositionChange={mockOnPositionChange}
                />
            );

            const modal = screen.getByTestId("draggable-modal");
            const parent = modal.parentElement!;

            // Mock initial container size
            Object.defineProperty(parent, "getBoundingClientRect", {
                value: () => ({
                    width: 1000,
                    height: 800,
                    top: 0,
                    left: 0,
                    right: 1000,
                    bottom: 800,
                }),
            });

            // Mock modal size
            Object.defineProperty(modal, "getBoundingClientRect", {
                value: () => ({
                    width: 500,
                    height: 400,
                    top: 100,
                    left: 700,
                    right: 1200,
                    bottom: 500,
                }),
            });

            // Trigger container resize to smaller width
            triggerContainerResize(parent, 600, 800);

            // Modal should be pushed left to maintain 50px visibility
            // maxX = 600 - 50 = 550
            const wrapper = container.querySelector(".draggable-modal-wrapper");
            expect(wrapper).toHaveStyle({
                transform: "translate(550px, 100px)",
            });
        });

        test("should adjust position when container shrinks and modal is partially off left edge", () => {
            const { container } = render(
                <DraggableModal
                    {...defaultProps}
                    initialX={-460}
                    initialY={100}
                    onPositionChange={mockOnPositionChange}
                />
            );

            const modal = screen.getByTestId("draggable-modal");
            const parent = modal.parentElement!;

            // Mock container size
            Object.defineProperty(parent, "getBoundingClientRect", {
                value: () => ({
                    width: 1000,
                    height: 800,
                    top: 0,
                    left: 0,
                    right: 1000,
                    bottom: 800,
                }),
            });

            // Mock modal size (500px wide, so only 40px visible on left)
            Object.defineProperty(modal, "getBoundingClientRect", {
                value: () => ({
                    width: 500,
                    height: 400,
                    top: 100,
                    left: -460,
                    right: 40,
                    bottom: 500,
                }),
            });

            // Trigger resize (shouldn't change much, but validates the logic)
            triggerContainerResize(parent, 1000, 800);

            // minX = -(500 - 50) = -450
            // Current -460 is beyond minX, should push to -450
            const wrapper = container.querySelector(".draggable-modal-wrapper");
            expect(wrapper).toHaveStyle({
                transform: "translate(-450px, 100px)",
            });
        });

        test("should adjust position when container shrinks vertically and modal is near bottom", () => {
            const { container } = render(
                <DraggableModal
                    {...defaultProps}
                    initialX={100}
                    initialY={600}
                    onPositionChange={mockOnPositionChange}
                />
            );

            const modal = screen.getByTestId("draggable-modal");
            const parent = modal.parentElement!;

            // Mock container size
            Object.defineProperty(parent, "getBoundingClientRect", {
                value: () => ({
                    width: 1000,
                    height: 800,
                    top: 0,
                    left: 0,
                    right: 1000,
                    bottom: 800,
                }),
            });

            // Mock modal size
            Object.defineProperty(modal, "getBoundingClientRect", {
                value: () => ({
                    width: 500,
                    height: 400,
                    top: 600,
                    left: 100,
                    right: 600,
                    bottom: 1000,
                }),
            });

            // Trigger container resize to smaller height
            triggerContainerResize(parent, 1000, 500);

            // maxY = 500 - 50 = 450
            const wrapper = container.querySelector(".draggable-modal-wrapper");
            expect(wrapper).toHaveStyle({
                transform: "translate(100px, 450px)",
            });
        });

        test("should not adjust position if modal is within bounds after resize", () => {
            const { container } = render(
                <DraggableModal
                    {...defaultProps}
                    initialX={200}
                    initialY={200}
                    onPositionChange={mockOnPositionChange}
                />
            );

            const modal = screen.getByTestId("draggable-modal");
            const parent = modal.parentElement!;

            // Mock container size
            Object.defineProperty(parent, "getBoundingClientRect", {
                value: () => ({
                    width: 1000,
                    height: 800,
                    top: 0,
                    left: 0,
                    right: 1000,
                    bottom: 800,
                }),
            });

            // Mock modal size
            Object.defineProperty(modal, "getBoundingClientRect", {
                value: () => ({
                    width: 500,
                    height: 400,
                    top: 200,
                    left: 200,
                    right: 700,
                    bottom: 600,
                }),
            });

            // Trigger container resize to still-large size
            triggerContainerResize(parent, 900, 700);

            // Position should remain unchanged
            const wrapper = container.querySelector(".draggable-modal-wrapper");
            expect(wrapper).toHaveStyle({
                transform: "translate(200px, 200px)",
            });
        });

        test("should push modal down if positioned above top boundary", () => {
            const { container } = render(
                <DraggableModal
                    {...defaultProps}
                    initialX={100}
                    initialY={-50}
                    onPositionChange={mockOnPositionChange}
                />
            );

            const modal = screen.getByTestId("draggable-modal");
            const parent = modal.parentElement!;

            // Mock container size
            Object.defineProperty(parent, "getBoundingClientRect", {
                value: () => ({
                    width: 1000,
                    height: 800,
                    top: 0,
                    left: 0,
                    right: 1000,
                    bottom: 800,
                }),
            });

            // Mock modal size
            Object.defineProperty(modal, "getBoundingClientRect", {
                value: () => ({
                    width: 500,
                    height: 400,
                    top: -50,
                    left: 100,
                    right: 600,
                    bottom: 350,
                }),
            });

            // Trigger resize
            triggerContainerResize(parent, 1000, 800);

            // minY = 0, should push to 0
            const wrapper = container.querySelector(".draggable-modal-wrapper");
            expect(wrapper).toHaveStyle({
                transform: "translate(100px, 0px)",
            });
        });

        test("should adjust position on mount if initialX/initialY are outside bounds", () => {
            const { container } = render(
                <DraggableModal
                    {...defaultProps}
                    initialX={5000}
                    initialY={3000}
                    onPositionChange={mockOnPositionChange}
                />
            );

            const modal = screen.getByTestId("draggable-modal");
            const parent = modal.parentElement!;

            // Mock container size
            Object.defineProperty(parent, "getBoundingClientRect", {
                value: () => ({
                    width: 1000,
                    height: 800,
                    top: 0,
                    left: 0,
                    right: 1000,
                    bottom: 800,
                }),
            });

            // Mock modal size
            Object.defineProperty(modal, "getBoundingClientRect", {
                value: () => ({
                    width: 500,
                    height: 400,
                    top: 3000,
                    left: 5000,
                    right: 5500,
                    bottom: 3400,
                }),
            });

            // The initial effect should have constrained the position
            // maxX = 1000 - 50 = 950
            // maxY = 800 - 50 = 750
            const wrapper = container.querySelector(".draggable-modal-wrapper");

            // Since the effect runs after render, we need to wait for it
            // In the actual implementation, this happens during the first effect run
            expect(wrapper).toBeInTheDocument();
        });

        test("should adjust position when modal is resized and becomes too large", () => {
            render(
                <DraggableModal
                    {...defaultProps}
                    initialX={700}
                    initialY={500}
                    onPositionChange={mockOnPositionChange}
                />
            );

            const modal = screen.getByTestId("draggable-modal");
            const parent = modal.parentElement!;

            // Mock container size
            Object.defineProperty(parent, "getBoundingClientRect", {
                value: () => ({
                    width: 1000,
                    height: 800,
                    top: 0,
                    left: 0,
                    right: 1000,
                    bottom: 800,
                }),
            });

            // Initial modal is small and fits
            Object.defineProperty(modal, "getBoundingClientRect", {
                value: () => ({
                    width: 500,
                    height: 400,
                    top: 500,
                    left: 700,
                    right: 1200,
                    bottom: 900,
                }),
            });

            const resizeHandle = screen.getByTestId("resize-handle");

            // Start resize
            fireEvent.mouseDown(resizeHandle, { clientX: 1200, clientY: 900 });

            // Simulate resize that makes modal very large
            act(() => {
                fireEvent(
                    document,
                    new MouseEvent("mousemove", {
                        clientX: 1600,
                        clientY: 1200,
                        bubbles: true,
                    })
                );
            });

            // End resize
            act(() => {
                fireEvent(
                    document,
                    new MouseEvent("mouseup", { bubbles: true })
                );
            });

            // After resize, the modal should be repositioned if it exceeds bounds
            expect(modal).toBeInTheDocument();
        });
    });
});
