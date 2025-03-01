import { useState, useEffect } from "react";
import { useHealthCheckSubscription } from "@graphql";
import { Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const GlowingIcon = styled(FontAwesomeIcon)`
    filter: drop-shadow(0 0 0.5em ${(props) => props.color});
    font-size: 0.5em;
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
        <Row className="align-items-center" style={{ fontSize: "0.8em" }}>
            <Col xs="auto" className="overflow-visible pe-0">
                <GlowingIcon
                    icon={faCircle}
                    color={statusColor}
                    style={{ margin: "0.5em 1em" }}
                />
            </Col>
            <Col xs="auto" className="p-0">
                {healthy ? "Healthy" : "Unhealthy"}
            </Col>
        </Row>
    );
};
