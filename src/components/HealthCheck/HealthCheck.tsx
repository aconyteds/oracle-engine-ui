import { useState, useEffect } from "react";
import { useHealthCheckSubscription } from "@graphql";
import { Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const GlowingIcon = styled(FontAwesomeIcon)`
    filter: drop-shadow(0 0 4px ${(props) => props.color});
    font-size: 0.8em;
`;

export const HealthCheck = () => {
    const [healthy, setHealthy] = useState(false);
    const [healthHistory, setHealthHistory] = useState<boolean[]>([]);
    const { data, restart } = useHealthCheckSubscription();

    useEffect(() => {
        if (healthy) {
            return;
        }
        restart();
    }, [healthy, restart]);

    useEffect(() => {
        if (data) {
            setHealthy(data.healthCheck);
            setHealthHistory((prev) => {
                const newHistory = [...prev, data.healthCheck].slice(-5);
                return newHistory;
            });
        }
    }, [data]);

    const getHealthStatus = () => {
        // If all entries are true, return green
        if (healthHistory.every((status) => status)) {
            return "green";
        }

        // If all entries are false, return red
        if (healthHistory.every((status) => !status)) {
            return "red";
        }

        // If any entry is false, return yellow
        return "yellow";
    };

    const statusColor = getHealthStatus();

    return (
        <Row className="align-items-center fs-6">
            <Col xs="auto" className="overflow-visible">
                <GlowingIcon
                    icon={faCircle}
                    color={statusColor}
                    className="m-2"
                />
            </Col>
            <Col xs="auto" className="p-0">
                {healthy ? "Healthy" : "Unhealthy"}
            </Col>
        </Row>
    );
};
