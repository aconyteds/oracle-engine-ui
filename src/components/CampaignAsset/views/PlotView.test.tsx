import { PlotStatus, Urgency } from "@graphql";
import "@testing-library/jest-dom";
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "../../../test-utils";
import type { PlotFormData } from "../types";
import { PlotView } from "./PlotView";

const createDefaultFormData = (): PlotFormData => ({
    name: "Test Plot",
    gmSummary: "GM summary content",
    playerSummary: "Player summary content",
    gmNotes: "Secret GM notes",
    playerNotes: "Public player notes",
    status: PlotStatus.InProgress,
    urgency: Urgency.Ongoing,
});

describe("PlotView Component", () => {
    afterEach(() => {
        cleanup();
    });

    test("should render GM Information and Player Information tabs", () => {
        const formData = createDefaultFormData();
        render(<PlotView formData={formData} />);

        expect(
            screen.getByRole("tab", { name: "GM Information" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("tab", { name: "Player Information" })
        ).toBeInTheDocument();
    });

    test("should render GM sections in GM Information tab", () => {
        const formData = createDefaultFormData();
        render(<PlotView formData={formData} />);

        // GM tab is active by default
        expect(screen.getByText("GM Summary")).toBeInTheDocument();
        expect(screen.getByText("Status & Urgency")).toBeInTheDocument();
        expect(screen.getByText("GM Notes")).toBeInTheDocument();
    });

    test("should render Player sections when Player Information tab is clicked", () => {
        const formData = createDefaultFormData();
        render(<PlotView formData={formData} />);

        // Click the Player Information tab
        fireEvent.click(
            screen.getByRole("tab", { name: "Player Information" })
        );

        expect(screen.getByText("Player Summary")).toBeInTheDocument();
        expect(screen.getByText("Player Notes")).toBeInTheDocument();
    });

    test("should display empty text when content is not provided", () => {
        const formData: PlotFormData = {
            name: "",
            gmSummary: "",
            playerSummary: "",
            gmNotes: "",
            playerNotes: "",
            status: PlotStatus.Unknown,
            urgency: Urgency.Ongoing,
        };
        render(<PlotView formData={formData} />);

        expect(screen.getByText("No GM summary provided")).toBeInTheDocument();
    });

    test("should display status and urgency badges", () => {
        const formData = createDefaultFormData();
        render(<PlotView formData={formData} />);

        // Check for the formatted status and urgency values
        expect(screen.getByText("In Progress")).toBeInTheDocument();
        expect(screen.getByText("Ongoing")).toBeInTheDocument();
    });

    test("should display different status values correctly", () => {
        const formData = createDefaultFormData();
        formData.status = PlotStatus.Rumored;
        formData.urgency = Urgency.Critical;
        render(<PlotView formData={formData} />);

        expect(screen.getByText("Rumored")).toBeInTheDocument();
        expect(screen.getByText("Critical")).toBeInTheDocument();
    });
});
