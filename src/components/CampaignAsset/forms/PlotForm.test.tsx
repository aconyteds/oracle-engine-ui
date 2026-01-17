import { PlotStatus, Urgency } from "@graphql";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../../test-utils";
import type { PlotFormData } from "../types";
import { PlotForm } from "./PlotForm";

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

    describe("field onChange handlers", () => {
        test.each([
            ["name", "Enter plot name", "New Plot Name"],
            ["gmSummary", "Brief description of the plot", "Test summary"],
            ["gmNotes", "GM notes (not visible to players)", "Secret GM notes"],
            [
                "playerNotes",
                "Information visible to players",
                "Public information",
            ],
        ])(
            "should call onChange when %s changes",
            (fieldName, placeholder, testValue) => {
                const mockOnChange = vi.fn();
                render(
                    <PlotForm
                        formData={createDefaultFormData()}
                        onChange={mockOnChange}
                    />
                );

                const input = screen.getByPlaceholderText(placeholder);
                fireEvent.change(input, { target: { value: testValue } });

                expect(mockOnChange).toHaveBeenCalledWith(fieldName, testValue);
            }
        );

        test.each([
            ["status", 0, PlotStatus.InProgress],
            ["urgency", 1, Urgency.Critical],
        ])(
            "should call onChange when %s select changes",
            (fieldName, selectIndex, testValue) => {
                const mockOnChange = vi.fn();
                const { container } = render(
                    <PlotForm
                        formData={createDefaultFormData()}
                        onChange={mockOnChange}
                    />
                );

                const selects = container.querySelectorAll("select");
                const select = selects[selectIndex] as HTMLSelectElement;

                fireEvent.change(select, { target: { value: testValue } });

                expect(mockOnChange).toHaveBeenCalledWith(fieldName, testValue);
            }
        );
    });

    describe("select options", () => {
        test.each([
            [
                "status",
                0,
                [
                    PlotStatus.Unknown,
                    PlotStatus.Rumored,
                    PlotStatus.InProgress,
                    PlotStatus.Closed,
                    PlotStatus.WillNotDo,
                ],
            ],
            [
                "urgency",
                1,
                [Urgency.Ongoing, Urgency.Critical, Urgency.Resolved],
            ],
        ])(
            "should render all %s options",
            (_, selectIndex, expectedOptions) => {
                const mockOnChange = vi.fn();
                const { container } = render(
                    <PlotForm
                        formData={createDefaultFormData()}
                        onChange={mockOnChange}
                    />
                );

                const selects = container.querySelectorAll("select");
                const select = selects[selectIndex] as HTMLSelectElement;
                const options = Array.from(select.options).map(
                    (option) => option.value
                );

                for (const expectedOption of expectedOptions) {
                    expect(options).toContain(expectedOption);
                }
            }
        );
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
