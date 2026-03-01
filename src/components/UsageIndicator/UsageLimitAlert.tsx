import { useUsageState } from "@signals";
import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";

import { useUserContext } from "../../contexts";
import UpgradeLink from "../Subscription/UpgradeLink";

export function UsageLimitAlert() {
    const { refreshUsage, currentUser } = useUserContext();
    const { isMonthlyLimitExceeded } = useUsageState();
    const [timeTillReset, setTimeTillReset] = useState<string>("");

    const subscriptionExpiresAt = currentUser?.subscriptionExpiresAt;

    // Countdown timer that refreshes usage data when it reaches zero
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const nextReset = new Date();
            nextReset.setUTCHours(24, 0, 0, 0);
            const diff = nextReset.getTime() - now.getTime();

            // If we've passed midnight UTC, refresh usage data
            if (diff <= 0) {
                refreshUsage();
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeTillReset(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [refreshUsage]);

    if (isMonthlyLimitExceeded) {
        let resetText: string;
        if (subscriptionExpiresAt) {
            const formatted = new Date(
                subscriptionExpiresAt
            ).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
            });
            resetText = `renews on ${formatted}`;
        } else {
            const nextMonth = new Date();
            nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1, 1);
            nextMonth.setUTCHours(0, 0, 0, 0);
            const resetDate = nextMonth.toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
            });
            resetText = `resets on ${resetDate} (1st of next month)`;
        }

        return (
            <Alert variant="danger" className="m-3">
                <Alert.Heading>Monthly Limit Reached</Alert.Heading>
                <p className="mb-0 font-monospace">
                    You've reached your monthly usage limit. Your limit{" "}
                    {resetText}. <UpgradeLink upgradeAvailable />
                </p>
            </Alert>
        );
    }

    return (
        <Alert variant="danger" className="m-3">
            <Alert.Heading>Daily Limit Reached</Alert.Heading>
            <p className="mb-0 font-monospace">
                You've reached your daily usage limit. Your limit resets in{" "}
                {timeTillReset} (midnight UTC).
                <UpgradeLink upgradeAvailable />
            </p>
        </Alert>
    );
}
