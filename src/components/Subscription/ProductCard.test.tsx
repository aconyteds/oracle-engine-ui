import { ProductType } from "@graphql";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "../../test-utils";
import { ProductCard } from "./ProductCard";

vi.mock("@fortawesome/react-fontawesome", () => ({
    FontAwesomeIcon: () => <span data-testid="fa-icon" />,
}));

describe("ProductCard", () => {
    const defaultProps = {
        name: "Game Master",
        description: "For serious DMs",
        priceInCents: 2000,
        type: ProductType.Subscription,
        features: ["Feature A", "Feature B"],
        isCurrentTier: false,
        action: {
            type: "upgrade" as const,
            onAction: vi.fn(),
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    test("should render product name", () => {
        render(<ProductCard {...defaultProps} />);
        expect(screen.getByText("Game Master")).toBeInTheDocument();
    });

    test("should render formatted price", () => {
        render(<ProductCard {...defaultProps} />);
        expect(screen.getByText("$20.00")).toBeInTheDocument();
    });

    test("should render description", () => {
        render(<ProductCard {...defaultProps} />);
        expect(screen.getByText("For serious DMs")).toBeInTheDocument();
    });

    test("should show /mo for subscription type", () => {
        render(<ProductCard {...defaultProps} />);
        expect(screen.getByText("/mo")).toBeInTheDocument();
    });

    test("should not show /mo for one-time type", () => {
        render(<ProductCard {...defaultProps} type={ProductType.OneTime} />);
        expect(screen.queryByText("/mo")).not.toBeInTheDocument();
    });

    describe("features list", () => {
        test("should render all features", () => {
            render(<ProductCard {...defaultProps} />);
            expect(screen.getByText("Feature A")).toBeInTheDocument();
            expect(screen.getByText("Feature B")).toBeInTheDocument();
        });

        test("should render check icons for each feature", () => {
            render(<ProductCard {...defaultProps} />);
            expect(screen.getAllByTestId("fa-icon")).toHaveLength(2);
        });

        test("should not render features list when empty", () => {
            const { container } = render(
                <ProductCard {...defaultProps} features={[]} />
            );
            expect(
                container.querySelector(".feature-list")
            ).not.toBeInTheDocument();
        });
    });

    describe("current tier styling", () => {
        test("should show Current Plan badge when isCurrentTier", () => {
            render(<ProductCard {...defaultProps} isCurrentTier />);
            const badge = screen.getByText("Current Plan", {
                selector: ".badge",
            });
            expect(badge).toBeInTheDocument();
        });

        test("should not show Current Plan badge when not current tier", () => {
            render(<ProductCard {...defaultProps} />);
            expect(screen.queryByText("Current Plan")).not.toBeInTheDocument();
        });

        test("should apply border-primary class when isCurrentTier", () => {
            const { container } = render(
                <ProductCard {...defaultProps} isCurrentTier />
            );
            const card = container.querySelector(".product-card");
            expect(card).toHaveClass("border-primary");
        });

        test("should not apply border-primary class when not current tier", () => {
            const { container } = render(<ProductCard {...defaultProps} />);
            const card = container.querySelector(".product-card");
            expect(card).not.toHaveClass("border-primary");
        });
    });

    describe("action buttons", () => {
        test("should show Upgrade button for upgrade action", () => {
            render(<ProductCard {...defaultProps} />);
            expect(
                screen.getByRole("button", { name: "Upgrade" })
            ).toBeInTheDocument();
        });

        test("should show Manage Subscription button for manage action", () => {
            render(
                <ProductCard
                    {...defaultProps}
                    action={{
                        type: "manage",
                        onAction: vi.fn(),
                    }}
                />
            );
            expect(
                screen.getByRole("button", {
                    name: "Manage Subscription",
                })
            ).toBeInTheDocument();
        });

        test("should not render button for none action", () => {
            render(<ProductCard {...defaultProps} action={{ type: "none" }} />);
            expect(screen.queryByRole("button")).not.toBeInTheDocument();
        });

        test("should call onAction when upgrade button clicked", () => {
            render(<ProductCard {...defaultProps} />);
            fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
            expect(defaultProps.action.onAction).toHaveBeenCalledOnce();
        });

        test("should call onAction when manage button clicked", () => {
            const onAction = vi.fn();
            render(
                <ProductCard
                    {...defaultProps}
                    action={{ type: "manage", onAction }}
                />
            );
            fireEvent.click(
                screen.getByRole("button", {
                    name: "Manage Subscription",
                })
            );
            expect(onAction).toHaveBeenCalledOnce();
        });

        test("should show Redirecting... and disable button when clicked", () => {
            // Never-resolving promise to keep the card in redirecting state
            const onAction = vi.fn(() => new Promise<void>(() => undefined));
            render(
                <ProductCard
                    {...defaultProps}
                    action={{ type: "upgrade", onAction }}
                />
            );
            fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
            expect(
                screen.getByRole("button", { name: "Redirecting..." })
            ).toBeDisabled();
        });

        test("should reset button if onAction throws", async () => {
            const onAction = vi.fn(() => Promise.reject(new Error("fail")));
            render(
                <ProductCard
                    {...defaultProps}
                    action={{ type: "upgrade", onAction }}
                />
            );
            fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
            await waitFor(() => {
                expect(
                    screen.getByRole("button", { name: "Upgrade" })
                ).not.toBeDisabled();
            });
        });
    });
});
