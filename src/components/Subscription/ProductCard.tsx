import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ProductType } from "@graphql";
import React, { useState } from "react";
import { Badge, Button, Card } from "react-bootstrap";
import { formatPrice } from "../../utils";

type CardAction =
    | { type: "upgrade"; onAction: () => void | Promise<void> }
    | { type: "manage"; onAction: () => void | Promise<void> }
    | { type: "none" };

type ProductCardProps = {
    name: string;
    description: string | null;
    priceInCents: number;
    type: ProductType;
    features: string[];
    isCurrentTier: boolean;
    action: CardAction;
};

export const ProductCard: React.FC<ProductCardProps> = ({
    name,
    description,
    priceInCents,
    type,
    features,
    isCurrentTier,
    action,
}) => {
    const [redirecting, setRedirecting] = useState(false);

    const buttonText =
        action.type === "upgrade" ? "Upgrade" : "Manage Subscription";

    const buttonVariant =
        action.type === "upgrade" ? "primary" : "outline-secondary";

    const handleClick = async () => {
        if (action.type === "none") return;
        setRedirecting(true);
        try {
            await action.onAction();
        } catch {
            setRedirecting(false);
        }
    };

    return (
        <Card
            className={`product-card h-100${isCurrentTier ? " border-primary" : ""}`}
        >
            <Card.Header className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">{name}</span>
                {isCurrentTier && <Badge bg="success">Current Plan</Badge>}
            </Card.Header>
            <Card.Body className="d-flex flex-column">
                <div className="product-price mb-3">
                    {formatPrice(priceInCents)}
                    {type === "SUBSCRIPTION" && (
                        <span className="price-interval text-muted">/mo</span>
                    )}
                </div>
                {description && <Card.Text>{description}</Card.Text>}
                {features.length > 0 && (
                    <ul className="feature-list list-unstyled mt-2 flex-grow-1">
                        {features.map((feature) => (
                            <li key={feature} className="mb-1">
                                <FontAwesomeIcon
                                    icon={faCheck}
                                    className="text-success me-2"
                                />
                                {feature}
                            </li>
                        ))}
                    </ul>
                )}
            </Card.Body>
            {action.type !== "none" && (
                <Card.Footer>
                    <Button
                        variant={buttonVariant}
                        className="w-100"
                        disabled={redirecting}
                        onClick={handleClick}
                    >
                        {redirecting ? "Redirecting..." : buttonText}
                    </Button>
                </Card.Footer>
            )}
        </Card>
    );
};
