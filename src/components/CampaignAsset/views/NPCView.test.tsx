import "@testing-library/jest-dom";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../../test-utils";
import type { NPCFormData } from "../types";
import { NPCView } from "./NPCView";

const createDefaultFormData = (): NPCFormData => ({
    name: "Test NPC",
    gmSummary: "GM summary content",
    playerSummary: "Player summary content",
    physicalDescription: "Tall and imposing",
    motivation: "Seeking revenge",
    mannerisms: "Cracks knuckles often",
    gmNotes: "Secret GM notes",
    playerNotes: "Public player notes",
});

describe("NPCView Component", () => {
    afterEach(() => {
        cleanup();
    });

    test("should render GM Information and Player Information tabs", () => {
        const formData = createDefaultFormData();
        render(<NPCView formData={formData} />);

        expect(
            screen.getByRole("tab", { name: "GM Information" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("tab", { name: "Player Information" })
        ).toBeInTheDocument();
    });

    test("should render GM sections in GM Information tab", () => {
        const formData = createDefaultFormData();
        render(<NPCView formData={formData} />);

        // GM tab is active by default
        expect(screen.getByText("GM Summary")).toBeInTheDocument();
        expect(screen.getByText("Physical Description")).toBeInTheDocument();
        expect(screen.getByText("Motivation")).toBeInTheDocument();
        expect(screen.getByText("Mannerisms")).toBeInTheDocument();
        expect(screen.getByText("GM Notes")).toBeInTheDocument();
    });

    test("should render Player sections when Player Information tab is clicked", () => {
        const formData = createDefaultFormData();
        render(<NPCView formData={formData} />);

        // Click the Player Information tab
        fireEvent.click(
            screen.getByRole("tab", { name: "Player Information" })
        );

        expect(screen.getByText("Player Summary")).toBeInTheDocument();
        expect(screen.getByText("Player Notes")).toBeInTheDocument();
    });

    test("should display empty text when content is not provided", () => {
        const formData: NPCFormData = {
            name: "",
            gmSummary: "",
            playerSummary: "",
            physicalDescription: "",
            motivation: "",
            mannerisms: "",
            gmNotes: "",
            playerNotes: "",
        };
        render(<NPCView formData={formData} />);

        expect(screen.getByText("No GM summary provided")).toBeInTheDocument();
    });
});
