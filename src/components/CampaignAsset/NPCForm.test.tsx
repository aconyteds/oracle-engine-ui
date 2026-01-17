import "@testing-library/jest-dom";
import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { NPCForm } from "./NPCForm";
import type { NPCFormData } from "./types";

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

    test("should call onChange with field and value when name changes", () => {
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

        fireEvent.change(nameInput, { target: { value: "New NPC Name" } });

        expect(mockOnChange).toHaveBeenCalledWith("name", "New NPC Name");
    });

    test("should call onChange when physical description changes", () => {
        const mockOnChange = vi.fn();
        render(
            <NPCForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const physicalInput = screen.getByPlaceholderText(
            "Describe the NPC's appearance"
        ) as HTMLTextAreaElement;

        fireEvent.change(physicalInput, {
            target: { value: "Tall and muscular" },
        });

        expect(mockOnChange).toHaveBeenCalledWith(
            "physicalDescription",
            "Tall and muscular"
        );
    });

    test("should call onChange when motivation changes", () => {
        const mockOnChange = vi.fn();
        render(
            <NPCForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const motivationInput = screen.getByPlaceholderText(
            "What drives this NPC?"
        ) as HTMLTextAreaElement;

        fireEvent.change(motivationInput, {
            target: { value: "Seeking revenge" },
        });

        expect(mockOnChange).toHaveBeenCalledWith(
            "motivation",
            "Seeking revenge"
        );
    });

    test("should call onChange when mannerisms changes", () => {
        const mockOnChange = vi.fn();
        render(
            <NPCForm
                formData={createDefaultFormData()}
                onChange={mockOnChange}
            />
        );

        const mannerismsInput = screen.getByPlaceholderText(
            "Distinctive behaviors, speech patterns, or quirks"
        ) as HTMLTextAreaElement;

        fireEvent.change(mannerismsInput, {
            target: { value: "Cracks knuckles often" },
        });

        expect(mockOnChange).toHaveBeenCalledWith(
            "mannerisms",
            "Cracks knuckles often"
        );
    });

    test("should call onChange when GM notes changes", () => {
        const mockOnChange = vi.fn();
        render(
            <NPCForm
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
            <NPCForm
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
