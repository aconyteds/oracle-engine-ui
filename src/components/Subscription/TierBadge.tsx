import React from "react";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts";
import { useFeatures } from "../../hooks";
import { getTierConfig, isFreeTier } from "../../utils";
import { LogEvent } from "../firebase";

export const TierBadge: React.FC = () => {
    const { currentUser } = useUserContext();
    const navigate = useNavigate();
    const { monetizationEnabled } = useFeatures();

    const tier = currentUser?.subscriptionTier;
    const config = getTierConfig(tier);
    const isFree = isFreeTier(tier);

    const handleClick = () => {
        LogEvent("tier_badge_click");
        navigate("/subscription");
    };

    if (!monetizationEnabled) {
        return (
            <Badge
                bg=""
                role="none"
                className={`tier-badge border border-${config.variant} text-${config.variant}`}
            >
                {tier ?? "Free"}
            </Badge>
        );
    }

    const tooltipText = isFree ? "Upgrade your plan" : "Manage subscription";

    return (
        <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="tier-tooltip">{tooltipText}</Tooltip>}
        >
            <Badge
                bg=""
                role="button"
                className={`tier-badge actionable border border-${config.variant} text-${config.variant}`}
                onClick={handleClick}
            >
                {tier ?? "Free"}
            </Badge>
        </OverlayTrigger>
    );
};
