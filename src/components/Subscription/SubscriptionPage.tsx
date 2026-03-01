import {
    useGetProductsQuery,
    useManageSubscriptionMutation,
    useStartCheckoutMutation,
} from "@graphql";
import React, { useMemo } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUserContext } from "../../contexts";
import {
    getCardActionType,
    getTierIndex,
    isFreeTier,
    sortProductsByPrice,
} from "../../utils";
import { LogEvent } from "../firebase";
import { Loader } from "../Loader";
import { ProductCard } from "./ProductCard";
import "./Subscription.scss";

export const SubscriptionPage: React.FC = () => {
    const { currentUser } = useUserContext();
    const { data, loading, error } = useGetProductsQuery();
    const [startCheckout] = useStartCheckoutMutation();
    const [manageSubscription] = useManageSubscriptionMutation();

    const userTier = currentUser?.subscriptionTier ?? "Free";

    const sortedProducts = useMemo(
        () => sortProductsByPrice(data?.products ?? []),
        [data?.products]
    );

    const currentTierIndex = useMemo(() => {
        const index = getTierIndex(userTier, sortedProducts);
        // If tier not found and user isn't free (e.g., Admin),
        // treat as highest tier so all cards show "manage"
        if (index === -1 && !isFreeTier(userTier)) {
            return sortedProducts.length;
        }
        return Math.max(index, 0);
    }, [userTier, sortedProducts]);

    const handleCheckout = async (productId: string) => {
        LogEvent("subscription_checkout_start");
        const { data: checkoutData } = await startCheckout({
            variables: { input: { productId } },
        });
        if (checkoutData?.startCheckoutSession.checkoutUrl) {
            window.location.href =
                checkoutData.startCheckoutSession.checkoutUrl;
        }
    };

    const handleManageSubscription = async () => {
        LogEvent("subscription_manage_click");
        const { data: portalData } = await manageSubscription({
            variables: {
                input: { returnUrl: window.location.origin },
            },
        });
        if (portalData?.createCustomerPortalSession.customerPortalUrl) {
            window.location.href =
                portalData.createCustomerPortalSession.customerPortalUrl;
        }
    };

    const getAction = (productIndex: number, productId: string) => {
        const actionType = getCardActionType(productIndex, currentTierIndex);
        switch (actionType) {
            case "upgrade":
                return {
                    type: "upgrade" as const,
                    onAction: isFreeTier(userTier)
                        ? () => handleCheckout(productId)
                        : handleManageSubscription,
                };
            case "manage":
                return {
                    type: "manage" as const,
                    onAction: handleManageSubscription,
                };
            case "none":
                return { type: "none" as const };
        }
    };

    React.useEffect(() => {
        LogEvent("view_subscription_page");
    }, []);

    if (loading) return <Loader />;

    return (
        <Container className="subscription-page">
            <div className="mb-4">
                <Link to="/" className="text-decoration-none">
                    &larr; Back to Oracle Engine
                </Link>
            </div>
            <h2 className="mb-2">Subscription Plans</h2>
            <p className="text-muted mb-4">
                Choose a plan that fits your needs.
            </p>

            {error && (
                <p className="text-danger">
                    Failed to load products. Please try again later.
                </p>
            )}

            <Row className="g-4 mb-4">
                {sortedProducts.map((product, index) => (
                    <Col key={product.productId} xs={12} lg={6} xl={4}>
                        <ProductCard
                            name={product.name}
                            description={product.description}
                            priceInCents={product.priceInCents}
                            type={product.type}
                            features={product.features}
                            isCurrentTier={product.name === userTier}
                            action={getAction(index, product.productId)}
                        />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};
