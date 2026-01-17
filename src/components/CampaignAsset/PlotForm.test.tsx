import { PlotStatus, Urgency } from "@graphql";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { PlotForm } from "./PlotForm";
import type { PlotFormData } from "./types";

const createDefaultFormData = (): PlotFormData => ({
    name: "",
    gmSummary: "",
    playerSummary: "",
    status: PlotStatus.Rumored,
    urgency: Urgency.Ongoing,
    gmNotes: "",
    playerNotes: "",
});

describe("PlotForm Component", () => {
    afterEach(() => {
        cleanup();
    });

    test("should render form with all fields", () => {
        const mockOnChange = vi.fn();
        render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        expect(
            screen.getByPlaceholderText("Enter plot name")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Brief description of the plot")
        ).toBeInTheDocument();
        expect(screen.getByText(/Status/i)).toBeInTheDocument();
        expect(screen.getByText(/Urgency/i)).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("GM notes (not visible to players)")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Information visible to players")
        ).toBeInTheDocument();
    });

    test("should display provided form data", () => {
        const mockOnChange = vi.fn();
        const formData: PlotFormData = {
            name: "Test Plot",
            gmSummary: "Test Summary",
            playerSummary: "",
            status: PlotStatus.InProgress,
            urgency: Urgency.Critical,
            gmNotes: "GM Notes",
            playerNotes: "Player Notes",
        };

        const { container } = render(
            <PlotForm formData={formData} onChange={mockOnChange} />
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter plot name"
        ) as HTMLInputElement;
        expect(nameInput.value).toBe("Test Plot");

        const summaryInput = screen.getByPlaceholderText(
            "Brief description of the plot"
        ) as HTMLTextAreaElement;
        expect(summaryInput.value).toBe("Test Summary");

        const selects = container.querySelectorAll("select");
        const statusSelect = selects[0] as HTMLSelectElement;
        const urgencySelect = selects[1] as HTMLSelectElement;

        expect(statusSelect.value).toBe(PlotStatus.InProgress);
        expect(urgencySelect.value).toBe(Urgency.Critical);
    });

    test("should call onChange with field and value when name changes", () => {
        const mockOnChange = vi.fn();
        render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter plot name"
        ) as HTMLInputElement;

        fireEvent.change(nameInput, { target: { value: "New Plot Name" } });

        expect(mockOnChange).toHaveBeenCalledWith("name", "New Plot Name");
    });

    test("should call onChange when summary changes", () => {
        const mockOnChange = vi.fn();
        render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const summaryInput = screen.getByPlaceholderText(
            "Brief description of the plot"
        ) as HTMLTextAreaElement;

        fireEvent.change(summaryInput, {
            target: { value: "This is a test summary" },
        });

        expect(mockOnChange).toHaveBeenCalledWith(
            "gmSummary",
            "This is a test summary"
        );
    });

    test("should call onChange when status changes", () => {
        const mockOnChange = vi.fn();
        const { container } = render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const selects = container.querySelectorAll("select");
        const statusSelect = selects[0] as HTMLSelectElement;

        fireEvent.change(statusSelect, {
            target: { value: PlotStatus.InProgress },
        });

        expect(mockOnChange).toHaveBeenCalledWith(
            "status",
            PlotStatus.InProgress
        );
    });

    test("should call onChange when urgency changes", () => {
        const mockOnChange = vi.fn();
        const { container } = render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const selects = container.querySelectorAll("select");
        const urgencySelect = selects[1] as HTMLSelectElement;

        fireEvent.change(urgencySelect, {
            target: { value: Urgency.Critical },
        });

        expect(mockOnChange).toHaveBeenCalledWith("urgency", Urgency.Critical);
    });

    test("should call onChange when GM notes changes", () => {
        const mockOnChange = vi.fn();
        render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const notesInput = screen.getByPlaceholderText(
            "GM notes (not visible to players)"
        ) as HTMLTextAreaElement;

        fireEvent.change(notesInput, {
            target: { value: "Secret GM notes" },
        });

        expect(mockOnChange).toHaveBeenCalledWith("gmNotes", "Secret GM notes");
    });

    test("should call onChange when player notes changes", () => {
        const mockOnChange = vi.fn();
        render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const sharedInput = screen.getByPlaceholderText(
            "Information visible to players"
        ) as HTMLTextAreaElement;

        fireEvent.change(sharedInput, {
            target: { value: "Public information" },
        });

        expect(mockOnChange).toHaveBeenCalledWith(
            "playerNotes",
            "Public information"
        );
    });

    test("should render all status options", () => {
        const mockOnChange = vi.fn();
        const { container } = render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
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
        const mockOnChange = vi.fn();
        const { container } = render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
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
        const mockOnChange = vi.fn();
        render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter plot name"
        ) as HTMLInputElement;

        expect(nameInput.value).toBe("");
        expect(nameInput).toBeInvalid();
    });

    test("should mark required field with asterisk", () => {
        const mockOnChange = vi.fn();
        render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const asterisks = screen.getAllByText("*");
        expect(asterisks.length).toBeGreaterThan(0);
    });

    test("should have proper SCSS class on form", () => {
        const mockOnChange = vi.fn();
        const { container } = render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const form = container.querySelector("form");
        expect(form).toHaveClass("plot-form");
    });

    test("should have proper placeholder texts", () => {
        const mockOnChange = vi.fn();
        render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        expect(
            screen.getByPlaceholderText("Enter plot name")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Brief description of the plot")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("GM notes (not visible to players)")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Information visible to players")
        ).toBeInTheDocument();
    });

    test("should disable inputs when disabled prop is true", () => {
        const mockOnChange = vi.fn();
        const { container } = render(
            <PlotForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
                disabled={true}
            />
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter plot name"
        ) as HTMLInputElement;
        expect(nameInput).toBeDisabled();

        const summaryInput = screen.getByPlaceholderText(
            "Brief description of the plot"
        ) as HTMLTextAreaElement;
        expect(summaryInput).toBeDisabled();

        const selects = container.querySelectorAll("select");
        selects.forEach((select) => {
            expect(select).toBeDisabled();
        });
    });
});
