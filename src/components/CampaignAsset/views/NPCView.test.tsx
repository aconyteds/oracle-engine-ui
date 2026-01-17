import "@testing-library/jest-dom";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "../../../test-utils";
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

    test("should render NPC name as heading", () => {
        const formData = createDefaultFormData();
        render(<NPCView formData={formData} />);

        const heading = screen.getByRole("heading", { name: "Test NPC" });
        expect(heading).toBeInTheDocument();
    });

    test("should render all NPC sections", () => {
        const formData = createDefaultFormData();
        render(<NPCView formData={formData} />);

        expect(screen.getByText("GM Summary")).toBeInTheDocument();
        expect(screen.getByText("Physical Description")).toBeInTheDocument();
        expect(screen.getByText("Motivation")).toBeInTheDocument();
        expect(screen.getByText("Mannerisms")).toBeInTheDocument();
        expect(screen.getByText("GM Notes")).toBeInTheDocument();
        expect(screen.getByText("Player Summary")).toBeInTheDocument();
        expect(screen.getByText("Player Notes")).toBeInTheDocument();
    });

    test("should render 'Shared with Players' section", () => {
        const formData = createDefaultFormData();
        render(<NPCView formData={formData} />);

        expect(
            screen.getByRole("heading", { name: "Shared with Players" })
        ).toBeInTheDocument();
    });

    test("should display 'Untitled NPC' when name is empty", () => {
        const formData = createDefaultFormData();
        formData.name = "";
        render(<NPCView formData={formData} />);

        const heading = screen.getByRole("heading", { name: "Untitled NPC" });
        expect(heading).toBeInTheDocument();
    });

    test("should have npc-view class", () => {
        const formData = createDefaultFormData();
        const { container } = render(<NPCView formData={formData} />);

        const npcView = container.querySelector(".npc-view");
        expect(npcView).toBeInTheDocument();
    });
});
