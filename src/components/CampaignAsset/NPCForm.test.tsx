import { MockedProvider } from "@apollo/client/testing";
import { RecordType } from "@graphql";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../test-utils";
import { NPCForm, type NPCFormRef } from "./NPCForm";

const mockModalState = {
    modalId: "test-modal-id",
    assetId: null,
    assetType: RecordType.NPC,
    name: "New Asset",
    isMinimized: false,
};

describe("NPCForm Component", () => {
    afterEach(() => {
        cleanup();
    });

    test("should render form with all fields", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={mockModalState} />
            </MockedProvider>
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
            screen.getByPlaceholderText("DM notes (not visible to players)")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Information visible to players")
        ).toBeInTheDocument();
    });

    test("should initialize with default values for new asset", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={mockModalState} />
            </MockedProvider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter NPC name"
        ) as HTMLInputElement;
        expect(nameInput.value).toBe("");
    });

    test("should initialize with modal name when provided", () => {
        const modalStateWithName = {
            ...mockModalState,
            name: "Existing NPC",
        };

        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={modalStateWithName} />
            </MockedProvider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter NPC name"
        ) as HTMLInputElement;
        expect(nameInput.value).toBe("Existing NPC");
    });

    test("should update name field on input", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={mockModalState} />
            </MockedProvider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter NPC name"
        ) as HTMLInputElement;

        fireEvent.change(nameInput, { target: { value: "New NPC Name" } });

        expect(nameInput.value).toBe("New NPC Name");
    });

    test("should update physical description field on input", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={mockModalState} />
            </MockedProvider>
        );

        const physicalInput = screen.getByPlaceholderText(
            "Describe the NPC's appearance"
        ) as HTMLTextAreaElement;

        fireEvent.change(physicalInput, {
            target: { value: "Tall and muscular" },
        });

        expect(physicalInput.value).toBe("Tall and muscular");
    });

    test("should update motivation field on input", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={mockModalState} />
            </MockedProvider>
        );

        const motivationInput = screen.getByPlaceholderText(
            "What drives this NPC?"
        ) as HTMLTextAreaElement;

        fireEvent.change(motivationInput, {
            target: { value: "Seeking revenge" },
        });

        expect(motivationInput.value).toBe("Seeking revenge");
    });

    test("should update mannerisms field on input", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={mockModalState} />
            </MockedProvider>
        );

        const mannerismsInput = screen.getByPlaceholderText(
            "Distinctive behaviors, speech patterns, or quirks"
        ) as HTMLTextAreaElement;

        fireEvent.change(mannerismsInput, {
            target: { value: "Cracks knuckles often" },
        });

        expect(mannerismsInput.value).toBe("Cracks knuckles often");
    });

    test("should update DM notes field on input", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={mockModalState} />
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
                <NPCForm modalState={mockModalState} />
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

    test("should show validation error when name is empty", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={mockModalState} />
            </MockedProvider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter NPC name"
        ) as HTMLInputElement;

        // Name starts empty for new assets
        expect(nameInput.value).toBe("");
        expect(nameInput).toBeInvalid();
    });

    test("should mark required field with asterisk", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={mockModalState} />
            </MockedProvider>
        );

        const asterisks = screen.getAllByText("*");
        expect(asterisks.length).toBeGreaterThan(0);
    });

    test("should expose getFormData method via ref", () => {
        const ref = { current: null } as React.RefObject<NPCFormRef>;

        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm ref={ref} modalState={mockModalState} />
            </MockedProvider>
        );

        expect(ref.current).not.toBeNull();
        expect(typeof ref.current?.getFormData).toBe("function");
    });

    test("should return form data via ref", () => {
        const ref = { current: null } as React.RefObject<NPCFormRef>;

        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm ref={ref} modalState={mockModalState} />
            </MockedProvider>
        );

        const formData = ref.current?.getFormData();

        expect(formData).toBeDefined();
        expect(formData?.name).toBe("");
        expect(formData?.physicalDescription).toBe("");
        expect(formData?.motivation).toBe("");
        expect(formData?.mannerisms).toBe("");
    });

    test("should return updated form data after changes", () => {
        const ref = { current: null } as React.RefObject<NPCFormRef>;

        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm ref={ref} modalState={mockModalState} />
            </MockedProvider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter NPC name"
        ) as HTMLInputElement;
        const physicalInput = screen.getByPlaceholderText(
            "Describe the NPC's appearance"
        ) as HTMLTextAreaElement;

        fireEvent.change(nameInput, { target: { value: "Test NPC" } });
        fireEvent.change(physicalInput, {
            target: { value: "Test Description" },
        });

        const formData = ref.current?.getFormData();

        expect(formData?.name).toBe("Test NPC");
        expect(formData?.physicalDescription).toBe("Test Description");
    });

    test("should have proper SCSS class on form", () => {
        const { container } = render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={mockModalState} />
            </MockedProvider>
        );

        const form = container.querySelector("form");
        expect(form).toHaveClass("npc-form");
    });

    test("should have proper placeholder texts", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={mockModalState} />
            </MockedProvider>
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
            screen.getByPlaceholderText("DM notes (not visible to players)")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Information visible to players")
        ).toBeInTheDocument();
    });

    test("should handle multiple field updates", () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <NPCForm modalState={mockModalState} />
            </MockedProvider>
        );

        const nameInput = screen.getByPlaceholderText(
            "Enter NPC name"
        ) as HTMLInputElement;
        const physicalInput = screen.getByPlaceholderText(
            "Describe the NPC's appearance"
        ) as HTMLTextAreaElement;
        const motivationInput = screen.getByPlaceholderText(
            "What drives this NPC?"
        ) as HTMLTextAreaElement;

        fireEvent.change(nameInput, { target: { value: "Complex NPC" } });
        fireEvent.change(physicalInput, {
            target: { value: "Scarred veteran" },
        });
        fireEvent.change(motivationInput, {
            target: { value: "Protect the innocent" },
        });

        expect(nameInput.value).toBe("Complex NPC");
        expect(physicalInput.value).toBe("Scarred veteran");
        expect(motivationInput.value).toBe("Protect the innocent");
    });
});
