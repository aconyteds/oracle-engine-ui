import {
    faChevronDown,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useState } from "react";
import { Button, Collapse, Form, Modal } from "react-bootstrap";
import { useToggle } from "@/hooks";
import { MarkdownRenderer } from "../Common";

type FeedbackModalProps = {
    show: boolean;
    onSubmit: (comments: string) => void;
    messageContent: string;
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
    show,
    onSubmit,
    messageContent,
}) => {
    const [comments, setComments] = useState("");
    const [showOriginal, setShowOriginal] = useToggle();

    const handleSubmit = useCallback(() => {
        onSubmit(comments);
        setComments("");
    }, [comments, onSubmit]);

    const handleClose = useCallback(() => {
        onSubmit("");
        setComments("");
    }, [onSubmit]);

    const handleCommentsChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const value = e.target.value;
        // Limit to 1000 characters
        if (value.length <= 1000) {
            setComments(value);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>Send Feedback</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div
                    className="d-flex justify-content-between align-items-center p-2 rounded border border-light-subtle mb-3"
                    onClick={setShowOriginal}
                    role="button"
                    aria-expanded={showOriginal}
                    style={{ cursor: "pointer" }}
                >
                    <h6 className="fw-bold small mb-0">
                        Show Original Message
                    </h6>
                    <FontAwesomeIcon
                        icon={showOriginal ? faChevronDown : faChevronRight}
                        size="sm"
                    />
                </div>
                <Collapse in={showOriginal}>
                    <div className="mb-3 p-3 border rounded bg-light">
                        <MarkdownRenderer content={messageContent} />
                    </div>
                </Collapse>
                <Form.Group controlId="feedbackComments">
                    <Form.Label>Additional Context</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder="Provide any additional context about the message..."
                        value={comments}
                        onChange={handleCommentsChange}
                        style={{ resize: "none" }}
                    />
                    <Form.Text className="text-muted">
                        {comments.length}/1000 characters
                    </Form.Text>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleSubmit}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
