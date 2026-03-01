import {
    faChartLine,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUsageState } from "@signals";
import { useEffect, useRef } from "react";
import { Col, OverlayTrigger, Popover, Row } from "react-bootstrap";
import styled from "styled-components";
import { useToaster, useUserContext } from "../../contexts";
import { SubscriptionStatus } from "../../graphql/generated";
import { useSessionStorage } from "../../hooks/useStorage";
import UpgradeLink from "../Subscription/UpgradeLink";

const UsageRow = styled(Row)`
    width: fit-content;
    margin: 0;
    cursor: help;
`;

type TextSeverity = "normal" | "info" | "success" | "warning" | "danger";

const UsageText = styled.span<{
    $severity: TextSeverity;
}>`
    color: ${(props) => {
        switch (props.$severity) {
            case "danger":
                return "var(--bs-danger)";
            case "warning":
                return "var(--bs-warning)";
            case "info":
                return "var(--bs-info)";
            case "success":
                return "var(--bs-success)";
            default:
                return "inherit";
        }
    }};
`;

export const UsageIndicator = () => {
    const { dailyUsage, monthlyUsage, isLimitExceeded } = useUsageState();
    const { currentUser } = useUserContext();
    const { toast } = useToaster();
    const [cancellationToastShown, setCancellationToastShown] =
        useSessionStorage<string | null>("cancellation-toast-shown", null);

    const subscriptionExpiresAt = currentUser?.subscriptionExpiresAt;
    const upgradeAvailable = currentUser?.upgradeAvailable ?? false;
    const expiresFormatted = subscriptionExpiresAt
        ? new Date(subscriptionExpiresAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
          })
        : null;

    const toastShownRef = useRef(false);

    useEffect(() => {
        if (
            currentUser?.subscriptionStatus !==
                SubscriptionStatus.CancelPending ||
            !subscriptionExpiresAt
        )
            return;

        const daysUntilExpiry =
            (new Date(subscriptionExpiresAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24);
        if (daysUntilExpiry >= 5) return;

        const today = new Date().toDateString();
        if (cancellationToastShown === today || toastShownRef.current) return;

        toastShownRef.current = true;
        toast.info({
            title: "Subscription Expiring",
            message: `Your subscription is set to expire on ${expiresFormatted}. You can renew anytime from the subscription page.`,
            duration: null,
        });
        setCancellationToastShown(today);
    }, [
        currentUser?.subscriptionStatus,
        subscriptionExpiresAt,
        cancellationToastShown,
        setCancellationToastShown,
        expiresFormatted,
        toast,
    ]);

    const dailyPercent = (dailyUsage?.percentUsed ?? 0) * 100;
    const monthlyPercent = (monthlyUsage?.percentUsed ?? 0) * 100;
    // Show whichever is higher — that's what will limit the user first
    const percentUsed = Math.max(dailyPercent, monthlyPercent);

    // Don't render if no usage data or below 50% threshold
    if ((!dailyUsage && !monthlyUsage) || percentUsed < 50) {
        return null;
    }

    const percentRemaining = Math.min(
        100,
        Math.max(0, Math.round(100 - percentUsed))
    );

    const dailyRemaining = Math.min(
        100,
        Math.max(0, Math.round(100 - dailyPercent))
    );
    const monthlyRemaining = Math.min(
        100,
        Math.max(0, Math.round(100 - monthlyPercent))
    );

    // Determine severity based on usage percentage
    let severity: TextSeverity = "normal";
    if (percentUsed >= 90 || isLimitExceeded) {
        severity = "danger";
    } else if (percentUsed >= 80) {
        severity = "warning";
    } else if (percentUsed >= 70) {
        severity = "info";
    } else if (percentUsed >= 60) {
        severity = "normal";
    } else {
        severity = "success";
    }

    const monthlyResetText = expiresFormatted
        ? `(renews ${expiresFormatted})`
        : "(resets on the 1st)";

    const popover = (
        <Popover>
            <Popover.Header as="h3">Usage</Popover.Header>
            <Popover.Body>
                {dailyUsage && (
                    <p className="mb-1">
                        <strong>Daily:</strong> {dailyRemaining}% remaining
                        <span className="text-muted small">
                            {" "}
                            (resets at midnight UTC)
                        </span>
                    </p>
                )}
                {monthlyUsage && (
                    <p className="mb-1">
                        <strong>Monthly:</strong> {monthlyRemaining}% remaining
                        <span className="text-muted small">
                            {" "}
                            {monthlyResetText}
                        </span>
                    </p>
                )}
                <UpgradeLink upgradeAvailable={upgradeAvailable} />
            </Popover.Body>
        </Popover>
    );

    return (
        <OverlayTrigger
            trigger={["hover", "focus"]}
            placement="top"
            overlay={popover}
        >
            <UsageRow
                className="align-items-center"
                style={{ fontSize: "0.8em" }}
            >
                <Col xs="auto" className="p-0 me-1">
                    <FontAwesomeIcon
                        className={`text-${severity}`}
                        icon={
                            percentRemaining === 0
                                ? faTriangleExclamation
                                : faChartLine
                        }
                    />
                </Col>
                <Col xs="auto" className="p-0">
                    <UsageText $severity={severity}>
                        {Math.round(percentRemaining)}% remaining
                    </UsageText>
                </Col>
            </UsageRow>
        </OverlayTrigger>
    );
};
