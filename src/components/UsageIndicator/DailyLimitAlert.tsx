import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { useUserContext } from "../../contexts";

export function DailyLimitAlert() {
    const { refreshUsage } = useUserContext();
    const [timeTillReset, setTimeTillReset] = useState<string>("");

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

    return (
        <Alert variant="danger" className="m-3">
            <Alert.Heading>Daily Limit Reached</Alert.Heading>
            <p className="mb-0">
                You've reached your daily usage limit. Your limit resets in{" "}
                {timeTillReset} (midnight UTC). If you need more usage, please
                consider upgrading your subscription.
            </p>
        </Alert>
    );
}
