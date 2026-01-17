import "@testing-library/jest-dom";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../../test-utils";
import type { NPCFormData } from "../types";
import { NPCForm } from "./NPCForm";

const createDefaultFormData = (): NPCFormData => ({
    name: "",
    gmSummary: "",
    playerSummary: "",
    physicalDescription: "",
    motivation: "",
    mannerisms: "",
    gmNotes: "",
    playerNotes: "",
});

describe("NPCForm Component", () => {
    afterEach(() => {
        cleanup();
    });

    test("should render form with all fields", () => {
        const mockOnChange = vi.fn();
        render(
            <NPCForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        expect(
            screen.getByPlaceholderText("Enter NPC name")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Describe the NPC's appearance")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("What drives this NPC?")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(
                "Distinctive behaviors, speech patterns, or quirks"
            )
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("GM notes (not visible to players)")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Information visible to players")
        ).toBeInTheDocument();
    });

    test("should display provided form data", () => {
        const mockOnChange = vi.fn();
        const formData: NPCFormData = {
            name: "Test NPC",
            gmSummary: "GM Summary",
            playerSummary: "Player Summary",
            physicalDescription: "Tall and muscular",
            motivation: "Seeking revenge",
            mannerisms: "Cracks knuckles",
            gmNotes: "GM Notes",
            playerNotes: "Player Notes",
        };

        render(<NPCForm formData={formData} onChange={mockOnChange} />);

        const nameInput = screen.getByPlaceholderText(
            "Enter NPC name"
        ) as HTMLInputElement;
        expect(nameInput.value).toBe("Test NPC");

        const physicalInput = screen.getByPlaceholderText(
            "Describe the NPC's appearance"
        ) as HTMLTextAreaElement;
        expect(physicalInput.value).toBe("Tall and muscular");
    });

    describe("field onChange handlers", () => {
        test.each([
            ["name", "Enter NPC name", "New NPC Name"],
            [
                "physicalDescription",
                "Describe the NPC's appearance",
                "Tall and muscular",
            ],
            ["motivation", "What drives this NPC?", "Seeking revenge"],
            [
                "mannerisms",
                "Distinctive behaviors, speech patterns, or quirks",
                "Cracks knuckles often",
            ],
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
                    <NPCForm
                        formData={createDefaultFormData()}
                        onChange={mockOnChange}
                    />
                );

                const input = screen.getByPlaceholderText(placeholder);
                fireEvent.change(input, { target: { value: testValue } });

                expect(mockOnChange).toHaveBeenCalledWith(fieldName, testValue);
            }
        );
    });

    test("should show validation error when name is empty", () => {
        const mockOnChange = vi.fn();
        render(
            <NPCForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter NPC name"
        ) as HTMLInputElement;

        expect(nameInput.value).toBe("");
        expect(nameInput).toBeInvalid();
    });

    test("should mark required field with asterisk", () => {
        const mockOnChange = vi.fn();
        render(
            <NPCForm
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
            <NPCForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const form = container.querySelector("form");
        expect(form).toHaveClass("npc-form");
    });

    test("should have proper placeholder texts", () => {
        const mockOnChange = vi.fn();
        render(
            <NPCForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        expect(
            screen.getByPlaceholderText("Enter NPC name")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Describe the NPC's appearance")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("What drives this NPC?")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(
                "Distinctive behaviors, speech patterns, or quirks"
            )
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
        render(
            <NPCForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
                disabled={true}
            />
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter NPC name"
        ) as HTMLInputElement;
        expect(nameInput).toBeDisabled();

        const physicalInput = screen.getByPlaceholderText(
            "Describe the NPC's appearance"
        ) as HTMLTextAreaElement;
        expect(physicalInput).toBeDisabled();
    });
});
