import { useThreadsContext } from "@context";
import {
    faSpinner,
    faStop,
    faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { ExpandingTextArea } from "../Common";
import "./MessageInput.scss";

export const MessageInput = () => {
    const { sendMessage, isGenerating } = useThreadsContext();
    const [text, setText] = useState("");

    const handleSubmit = (text: string) => {
        sendMessage(text);
        setText("");
    };

    const handleChange = (text: string) => {
        setText(text);
    };

    const handleButtonClick = () => {
        handleSubmit(text);
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
                        }}
                    />
                </Col>
                <Col xs="auto" className="pe-2">
                    <Button
                        onClick={handleButtonClick}
                        title={
                            isGenerating
                                ? "Stop Generation"
                                : "Send a Message to the AI"
                        }
                        className="mt-2"
                        disabled={isGenerating}
                        variant="primary"
                    >
                        {isGenerating ? (
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
                        ) : (
                            <FontAwesomeIcon icon={faWandMagicSparkles} />
                        )}
                    </Button>
                </Col>
            </Row>
        </div>
    );
};
