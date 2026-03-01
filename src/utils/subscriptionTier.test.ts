import { describe, expect, test } from "vitest";
import {
    formatPrice,
    getCardActionType,
    getTierConfig,
    getTierIndex,
    isFreeTier,
    sortProductsByPrice,
} from "./subscriptionTier";

describe("subscriptionTier utils", () => {
    describe("getTierConfig", () => {
        test.each([
            ["Free", "secondary"],
            ["Game Master", "info"],
            ["World Builder", "warning"],
            ["Professional GM", "danger"],
            ["Admin", "dark"],
        ])(
            "should return correct variant for %s tier",
            (tier, expectedVariant) => {
                expect(getTierConfig(tier).variant).toBe(expectedVariant);
            }
        );

        test("should return Free config for null", () => {
            expect(getTierConfig(null).variant).toBe("secondary");
        });

        test("should return Free config for undefined", () => {
            expect(getTierConfig(undefined).variant).toBe("secondary");
        });

        test("should return Free config for unknown tier", () => {
            expect(getTierConfig("Unknown").variant).toBe("secondary");
        });
    });

    describe("isFreeTier", () => {
        test("should return true for null", () => {
            expect(isFreeTier(null)).toBe(true);
        });

        test("should return true for undefined", () => {
            expect(isFreeTier(undefined)).toBe(true);
        });

        test("should return true for empty string", () => {
            expect(isFreeTier("")).toBe(true);
        });

        test("should return true for Free", () => {
            expect(isFreeTier("Free")).toBe(true);
        });

        test("should return false for Game Master", () => {
            expect(isFreeTier("Game Master")).toBe(false);
        });

        test("should return false for Admin", () => {
            expect(isFreeTier("Admin")).toBe(false);
        });
    });

    describe("formatPrice", () => {
        test.each([
            [0, "$0.00"],
            [999, "$9.99"],
            [1000, "$10.00"],
            [2000, "$20.00"],
            [4000, "$40.00"],
            [6000, "$60.00"],
            [4999, "$49.99"],
        ])("should format %i cents as %s", (cents, expected) => {
            expect(formatPrice(cents)).toBe(expected);
        });
    });

    describe("sortProductsByPrice", () => {
        test("should sort products ascending by price", () => {
            const products = [
                { name: "Pro", priceInCents: 4000 },
                { name: "Free", priceInCents: 0 },
                { name: "Basic", priceInCents: 1000 },
            ];
            const sorted = sortProductsByPrice(products);
            expect(sorted.map((p) => p.name)).toEqual(["Free", "Basic", "Pro"]);
        });

        test("should not mutate original array", () => {
            const products = [
                { name: "B", priceInCents: 200 },
                { name: "A", priceInCents: 100 },
            ];
            sortProductsByPrice(products);
            expect(products[0].name).toBe("B");
        });
    });

    describe("getTierIndex", () => {
        const sorted = [
            { name: "Free", priceInCents: 0 },
            { name: "Game Master", priceInCents: 1000 },
            { name: "World Builder", priceInCents: 2000 },
        ];

        test.each([
            ["Free", 0],
            ["Game Master", 1],
            ["World Builder", 2],
        ])("should return correct index for %s", (tier, expected) => {
            expect(getTierIndex(tier, sorted)).toBe(expected);
        });

        test("should return -1 for unknown tier", () => {
            expect(getTierIndex("Unknown", sorted)).toBe(-1);
        });
    });

    describe("getCardActionType", () => {
        test.each([
            [0, 0, "none"],
            [1, 0, "upgrade"],
            [2, 0, "upgrade"],
            [0, 1, "manage"],
            [1, 1, "manage"],
            [2, 1, "upgrade"],
            [0, 2, "manage"],
            [1, 2, "manage"],
            [2, 2, "manage"],
        ])(
            "productIndex=%i, currentTierIndex=%i should return %s",
            (productIdx, currentIdx, expected) => {
                expect(getCardActionType(productIdx, currentIdx)).toBe(
                    expected
                );
            }
        );
    });
});
