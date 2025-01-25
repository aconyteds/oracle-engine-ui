import { useState } from "react";
import { ExpandingTextArea } from "../Common";
import { Col, Row, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { useThreadsContext } from "@context";

export const MessageInput = () => {
    const { sendMessage } = useThreadsContext();
    const [text, setText] = useState("");

    const handleSubmit = (text: string) => {
        sendMessage(text);
    };

    const handleChange = (text: string) => {
        setText(text);
    };

    const handleButtonClick = () => {
        handleSubmit(text);
    };

    return (
        <div className="position-relative border border-1 border-bottom-0 rounded-top pb-1">
            <Row direction="row" pr="2" gap="2">
                <Col>
                    <ExpandingTextArea
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                    />
                </Col>
                <Col xs="auto">
                    <Button
                        onClick={handleButtonClick}
                        title="Send a Message to the AI"
                        className="mt-2"
                    >
                        <FontAwesomeIcon icon={faWandMagicSparkles} />
                    </Button>
                </Col>
            </Row>
        </div>
    );
};
