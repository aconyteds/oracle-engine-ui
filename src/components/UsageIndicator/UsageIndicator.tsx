import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUsageState } from "@signals";
import { Col, OverlayTrigger, Popover, Row } from "react-bootstrap";
import styled from "styled-components";

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
    const { dailyUsage, isLimitExceeded } = useUsageState();

    // Don't render if no usage data or below 60% threshold
    // percentUsed comes as decimal (0.60 = 60%), so multiply by 100
    const percentUsed = (dailyUsage?.percentUsed ?? 0) * 100;
    if (!dailyUsage || percentUsed < 50) {
        return null;
    }

    const remaining = dailyUsage.limit - dailyUsage.current;
    const percentRemaining = Math.round(100 - percentUsed);

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

    const popover = (
        <Popover>
            <Popover.Header as="h3">Daily Usage</Popover.Header>
            <Popover.Body>
                <p>
                    <strong>{remaining}</strong> message
                    {remaining === 1 ? "" : "s"} remaining today
                    <br />({dailyUsage.current} of {dailyUsage.limit} used)
                </p>
                <p className="text-muted small mb-0">
                    Need more? Consider upgrading your subscription.
                </p>
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
                    <FontAwesomeIcon icon={faChartLine} />
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
