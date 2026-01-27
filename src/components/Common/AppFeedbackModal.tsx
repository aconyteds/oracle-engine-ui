import { useSendAppFeedbackMutation } from "@graphql";
import React, { useCallback, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useToaster } from "@/contexts";
import { LogEvent } from "../firebase";

export type AppFeedbackModalProps = {
    show: boolean;
    onHide: () => void;
};

export const AppFeedbackModal: React.FC<AppFeedbackModalProps> = ({
    show,
    onHide,
}) => {
    const [feedback, setFeedback] = useState("");
    const { toast } = useToaster();
    const [sendAppFeedback, { loading }] = useSendAppFeedbackMutation();

    const handleSubmit = useCallback(async () => {
        try {
            LogEvent("app_feedback");
            await sendAppFeedback({
                variables: {
                    input: {
                        message: feedback,
                    },
                },
            });

            toast.success({
                message: "Thank you for your feedback!",
            });
            setFeedback("");
            onHide();
        } catch (error) {
            console.error("Error sending feedback:", error);
            toast.danger({
                message: "Failed to submit feedback. Please try again.",
            });
        }
    }, [feedback, sendAppFeedback, toast, onHide]);

    const handleClose = useCallback(() => {
        setFeedback("");
        onHide();
    }, [onHide]);

    const handleFeedbackChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const value = e.target.value;
        if (value.length <= 1000) {
            setFeedback(value);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" centered>
            <Modal.Header closeButton>
                <Modal.Title>Send Feedback</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="appFeedback">
                    <Form.Label>How can we improve Oracle Engine?</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder="Share your thoughts, suggestions, or report issues..."
                        value={feedback}
                        onChange={handleFeedbackChange}
                        style={{ resize: "none" }}
                    />
                    <Form.Text className="text-muted">
                        {feedback.length}/1000 characters
                    </Form.Text>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer className="justify-content-end">
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!feedback.trim() || loading}
                >
                    {loading ? "Submitting..." : "Submit"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
