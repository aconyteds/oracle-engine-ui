import { useThreadsContext } from "@context";
import {
    faSpinner,
    faStop,
    faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { ExpandingTextArea } from "../Common";
import "./MessageInput.scss";

export const MessageInput = () => {
    const {
        sendMessage,
        isGenerating,
        canStartGeneration,
        abortCurrentGeneration,
    } = useThreadsContext();
    const [text, setText] = useState("");

    const handleSubmit = (text: string) => {
        if (!canStartGeneration) return;
        if (!text.trim()) return;
        sendMessage(text);
        setText("");
    };

    const handleChange = (text: string) => {
        setText(text);
    };

    const handleSendClick = () => {
        handleSubmit(text);
    };

    const handleAbortClick = () => {
        abortCurrentGeneration();
    };

    // Determine button state
    const isSendDisabled = !canStartGeneration || text.trim() === "";

    // Render the appropriate button based on state
    const renderButton = () => {
        if (isGenerating) {
            // Show abort button when generating on current thread
            return (
                <Button
                    onClick={handleAbortClick}
                    title="Cancel Generation"
                    className="mt-2"
                    variant="danger"
                >
                    <div className="position-relative">
                        <FontAwesomeIcon icon={faSpinner} spin />
                        <FontAwesomeIcon
                            icon={faStop}
                            className="position-absolute"
                            style={{
                                fontSize: "0.6em",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                        />
                    </div>
                </Button>
            );
        }

        // Show send button when not generating
        const button = (
            <Button
                onClick={handleSendClick}
                title={
                    !canStartGeneration
                        ? "Maximum 3 concurrent generations reached"
                        : "Send a Message to the AI"
                }
                className="mt-2"
                disabled={isSendDisabled}
                variant="primary"
            >
                <FontAwesomeIcon icon={faWandMagicSparkles} />
            </Button>
        );

        // Show tooltip when at generation limit
        if (!canStartGeneration) {
            return (
                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip id="generation-limit-tooltip">
                            Maximum 3 concurrent generations. Wait for one to
                            complete.
                        </Tooltip>
                    }
                >
                    <span className="d-inline-block">{button}</span>
                </OverlayTrigger>
            );
        }

        return button;
    };

    return (
        <div className="message-input-container bg-body-secondary shadow-lg rounded-top p-3 border border-bottom-0">
            <Row direction="row" pr="2" gap="2">
                <Col>
                    <ExpandingTextArea
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        styleProps={{
                            className: "no-highlight border-0 bg-transparent",
                            disabled: isGenerating,
                        }}
                    />
                </Col>
                <Col xs="auto" className="pe-2">
                    {renderButton()}
                </Col>
            </Row>
        </div>
    );
};
