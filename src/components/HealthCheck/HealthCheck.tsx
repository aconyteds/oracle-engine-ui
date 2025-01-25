import { useState, useEffect } from "react";
import { useHealthCheckSubscription } from "@graphql";
import { Col, Row } from "react-bootstrap";

export const HealthCheck = () => {
    const [healthy, setHealthy] = useState(false);
    const { data, restart } = useHealthCheckSubscription();
    useEffect(() => {
        if (healthy) {
            return;
        }
        restart();
    }, [healthy, restart]);

    useEffect(() => {
        console.log(data);
        if (data) {
            setHealthy(data.healthCheck);
        }
    }, [data]);

    return (
        <Row>
            <Col xs="auto">{healthy ? "Healthy" : "Unhealthy"}</Col>
        </Row>
    );
};
