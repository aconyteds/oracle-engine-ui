import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "../../test-utils";
import { UpgradeLink } from "./UpgradeLink";

describe("UpgradeLink", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    test("should render link to subscription page when upgradeAvailable and monetization enabled", () => {
        render(<UpgradeLink upgradeAvailable />, {
            env: { VITE_MONETIZATION_ENABLED: "true" },
        });

        const link = screen.getByRole("link", {
            name: /upgrading your subscription/,
        });
        expect(link).toHaveAttribute("href", "/subscription");
    });

    test("should render 'Please consider' text with the link", () => {
        render(<UpgradeLink upgradeAvailable />, {
            env: { VITE_MONETIZATION_ENABLED: "true" },
        });

        expect(screen.getByText(/Please consider/)).toBeInTheDocument();
    });

    test.each([
        {
            description: "upgradeAvailable is false",
            props: { upgradeAvailable: false },
            env: { VITE_MONETIZATION_ENABLED: "true" },
        },
        {
            description: "monetization is disabled",
            props: { upgradeAvailable: true },
            env: { VITE_MONETIZATION_ENABLED: "false" },
        },
        {
            description: "both conditions are false",
            props: { upgradeAvailable: false },
            env: { VITE_MONETIZATION_ENABLED: "false" },
        },
    ])("should return null when $description", ({ props, env }) => {
        render(<UpgradeLink upgradeAvailable={props.upgradeAvailable} />, {
            env,
        });

        expect(
            screen.queryByRole("link", {
                name: /upgrading your subscription/,
            })
        ).not.toBeInTheDocument();
    });
});
