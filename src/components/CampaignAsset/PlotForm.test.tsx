import { MockedProvider } from "@apollo/client/testing";
import { PlotStatus, RecordType, Urgency } from "@graphql";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { PlotForm, type PlotFormRef } from "./PlotForm";

const mockModalState = {
    modalId: "test-modal-id",
    assetId: null,
    assetType: RecordType.Plot,
    name: "New Asset",
    isMinimized: false,
};

describe("PlotForm Component", () => {
    afterEach(() => {
        cleanup();
    });

    test("should render form with all fields", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        expect(
            screen.getByPlaceholderText("Enter plot name")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Brief description of the plot")
        ).toBeInTheDocument();
        expect(screen.getByText(/Status/i)).toBeInTheDocument();
        expect(screen.getByText(/Urgency/i)).toBeInTheDocument();
        expect(screen.getByText(/Related/i)).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("DM notes (not visible to players)")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Information visible to players")
        ).toBeInTheDocument();
    });

    test("should initialize with default values for new asset", () => {
        const { container } = render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter plot name"
        ) as HTMLInputElement;
        expect(nameInput.value).toBe("");

        const selects = container.querySelectorAll("select");
        const statusSelect = selects[0] as HTMLSelectElement;
        const urgencySelect = selects[1] as HTMLSelectElement;

        expect(statusSelect.value).toBe(PlotStatus.Rumored);
        expect(urgencySelect.value).toBe(Urgency.Ongoing);
    });

    test("should initialize with modal name when provided", () => {
        const modalStateWithName = {
            ...mockModalState,
            name: "Existing Plot",
        };

        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={modalStateWithName} />
            </MockedProvider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter plot name"
        ) as HTMLInputElement;
        expect(nameInput.value).toBe("Existing Plot");
    });

    test("should update name field on input", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter plot name"
        ) as HTMLInputElement;

        fireEvent.change(nameInput, { target: { value: "New Plot Name" } });

        expect(nameInput.value).toBe("New Plot Name");
    });

    test("should update summary field on input", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const summaryInput = screen.getByPlaceholderText(
            "Brief description of the plot"
        ) as HTMLTextAreaElement;

        fireEvent.change(summaryInput, {
            target: { value: "This is a test summary" },
        });

        expect(summaryInput.value).toBe("This is a test summary");
    });

    test("should update status field on select", () => {
        const { container } = render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const selects = container.querySelectorAll("select");
        const statusSelect = selects[0] as HTMLSelectElement;

        fireEvent.change(statusSelect, {
            target: { value: PlotStatus.InProgress },
        });

        expect(statusSelect.value).toBe(PlotStatus.InProgress);
    });

    test("should update urgency field on select", () => {
        const { container } = render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const selects = container.querySelectorAll("select");
        const urgencySelect = selects[1] as HTMLSelectElement;

        fireEvent.change(urgencySelect, {
            target: { value: Urgency.Critical },
        });

        expect(urgencySelect.value).toBe(Urgency.Critical);
    });

    test("should update DM notes field on input", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const notesInput = screen.getByPlaceholderText(
            "DM notes (not visible to players)"
        ) as HTMLTextAreaElement;

        fireEvent.change(notesInput, {
            target: { value: "Secret DM notes" },
        });

        expect(notesInput.value).toBe("Secret DM notes");
    });

    test("should update shared with players field on input", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const sharedInput = screen.getByPlaceholderText(
            "Information visible to players"
        ) as HTMLTextAreaElement;

        fireEvent.change(sharedInput, {
            target: { value: "Public information" },
        });

        expect(sharedInput.value).toBe("Public information");
    });

    test("should render all status options", () => {
        const { container } = render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const selects = container.querySelectorAll("select");
        const statusSelect = selects[0] as HTMLSelectElement;
        const options = Array.from(statusSelect.options).map(
            (option) => option.value
        );

        expect(options).toContain(PlotStatus.Unknown);
        expect(options).toContain(PlotStatus.Rumored);
        expect(options).toContain(PlotStatus.InProgress);
        expect(options).toContain(PlotStatus.Closed);
        expect(options).toContain(PlotStatus.WillNotDo);
    });

    test("should render all urgency options", () => {
        const { container } = render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const selects = container.querySelectorAll("select");
        const urgencySelect = selects[1] as HTMLSelectElement;
        const options = Array.from(urgencySelect.options).map(
            (option) => option.value
        );

        expect(options).toContain(Urgency.Ongoing);
        expect(options).toContain(Urgency.Critical);
        expect(options).toContain(Urgency.Resolved);
    });

    test("should show validation error when name is empty", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter plot name"
        ) as HTMLInputElement;

        // Name starts empty for new assets
        expect(nameInput.value).toBe("");
        expect(nameInput).toBeInvalid();
    });

    test("should mark required field with asterisk", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const asterisks = screen.getAllByText("*");
        expect(asterisks.length).toBeGreaterThan(0);
    });

    test("should expose getFormData method via ref", () => {
        const ref = { current: null } as React.RefObject<PlotFormRef>;

        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm ref={ref} modalState={mockModalState} />
            </MockedProvider>
        );

        expect(ref.current).not.toBeNull();
        expect(typeof ref.current?.getFormData).toBe("function");
    });

    test("should return form data via ref", () => {
        const ref = { current: null } as React.RefObject<PlotFormRef>;

        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm ref={ref} modalState={mockModalState} />
            </MockedProvider>
        );

        const formData = ref.current?.getFormData();

        expect(formData).toBeDefined();
        expect(formData?.name).toBe("");
        expect(formData?.status).toBe(PlotStatus.Rumored);
        expect(formData?.urgency).toBe(Urgency.Ongoing);
        expect(formData?.relatedAssets).toEqual([]);
    });

    test("should return updated form data after changes", () => {
        const ref = { current: null } as React.RefObject<PlotFormRef>;

        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm ref={ref} modalState={mockModalState} />
            </MockedProvider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter plot name"
        ) as HTMLInputElement;
        const summaryInput = screen.getByPlaceholderText(
            "Brief description of the plot"
        ) as HTMLTextAreaElement;

        fireEvent.change(nameInput, { target: { value: "Test Plot" } });
        fireEvent.change(summaryInput, {
            target: { value: "Test Summary" },
        });

        const formData = ref.current?.getFormData();

        expect(formData?.name).toBe("Test Plot");
        expect(formData?.summary).toBe("Test Summary");
    });

    test("should have proper SCSS class on form", () => {
        const { container } = render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const form = container.querySelector("form");
        expect(form).toHaveClass("plot-modal");
    });

    test("should have proper placeholder texts", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        expect(
            screen.getByPlaceholderText("Enter plot name")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Brief description of the plot")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("DM notes (not visible to players)")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Information visible to players")
        ).toBeInTheDocument();
    });

    test("should handle multiple field updates", () => {
        const { container } = render(
            <MockedProvider mocks={[]} addTypename={false}>
                <PlotForm modalState={mockModalState} />
            </MockedProvider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter plot name"
        ) as HTMLInputElement;
        const selects = container.querySelectorAll("select");
        const statusSelect = selects[0] as HTMLSelectElement;
        const urgencySelect = selects[1] as HTMLSelectElement;

        fireEvent.change(nameInput, { target: { value: "Complex Plot" } });
        fireEvent.change(statusSelect, {
            target: { value: PlotStatus.InProgress },
        });
        fireEvent.change(urgencySelect, {
            target: { value: Urgency.Critical },
        });

        expect(nameInput.value).toBe("Complex Plot");
        expect(statusSelect.value).toBe(PlotStatus.InProgress);
        expect(urgencySelect.value).toBe(Urgency.Critical);
    });
});
