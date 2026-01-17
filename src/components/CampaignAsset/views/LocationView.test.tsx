import "@testing-library/jest-dom";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../../test-utils";
import type { LocationFormData } from "../types";
import { LocationView } from "./LocationView";

const createDefaultFormData = (): LocationFormData => ({
    name: "Test Location",
    gmSummary: "GM summary content",
    playerSummary: "Player summary content",
    description: "A dark and mysterious cave",
    condition: "Damp and cold",
    characters: "Guard Captain Marcus",
    pointsOfInterest: "Ancient altar in the center",
    gmNotes: "Secret GM notes",
    playerNotes: "Public player notes",
});

describe("LocationView Component", () => {
    afterEach(() => {
        cleanup();
    });

    test("should render GM Information and Player Information tabs", () => {
        const formData = createDefaultFormData();
        render(<LocationView formData={formData} />);

        expect(
            screen.getByRole("tab", { name: "GM Information" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("tab", { name: "Player Information" })
        ).toBeInTheDocument();
    });

    test("should render GM sections in GM Information tab", () => {
        const formData = createDefaultFormData();
        render(<LocationView formData={formData} />);

        // GM tab is active by default
        expect(screen.getByText("GM Summary")).toBeInTheDocument();
        expect(screen.getByText("Description")).toBeInTheDocument();
        expect(screen.getByText("Condition")).toBeInTheDocument();
        expect(screen.getByText("Characters")).toBeInTheDocument();
        expect(screen.getByText("Points of Interest")).toBeInTheDocument();
        expect(screen.getByText("GM Notes")).toBeInTheDocument();
    });

    test("should render Player sections when Player Information tab is clicked", () => {
        const formData = createDefaultFormData();
        render(<LocationView formData={formData} />);

        // Click the Player Information tab
        fireEvent.click(
            screen.getByRole("tab", { name: "Player Information" })
        );

        expect(screen.getByText("Player Summary")).toBeInTheDocument();
        expect(screen.getByText("Player Notes")).toBeInTheDocument();
    });

    test("should display empty text when content is not provided", () => {
        const formData: LocationFormData = {
            name: "",
            gmSummary: "",
            playerSummary: "",
            description: "",
            condition: "",
            characters: "",
            pointsOfInterest: "",
            gmNotes: "",
            playerNotes: "",
        };
        render(<LocationView formData={formData} />);

        expect(screen.getByText("No GM summary provided")).toBeInTheDocument();
    });

    test("should not render Condition section when condition is empty", () => {
        const formData = createDefaultFormData();
        formData.condition = "";
        render(<LocationView formData={formData} />);

        // The Condition label should not be present when condition is empty
        expect(screen.queryByText("Condition")).not.toBeInTheDocument();
    });

    test("should render Condition section when condition has value", () => {
        const formData = createDefaultFormData();
        render(<LocationView formData={formData} />);

        expect(screen.getByText("Condition")).toBeInTheDocument();
        expect(screen.getByText("Damp and cold")).toBeInTheDocument();
    });
});
