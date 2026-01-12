import {
    faThumbsDown as faThumbsDownRegular,
    faThumbsUp as faThumbsUpRegular,
} from "@fortawesome/free-regular-svg-icons";
import { faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSendFeedbackMutation } from "@graphql";
import React, { useCallback, useState } from "react";
import { useToaster } from "@/contexts";
import { LogEvent } from "../firebase";
import { FeedbackModal } from "./FeedbackModal";

type FeedbackButtonsProps = {
    messageId: string;
    messageContent: string;
    currentSentiment?: boolean | null;
    onFeedbackProvided?: (sentiment: boolean) => void;
};

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
    messageId,
    messageContent,
    currentSentiment,
    onFeedbackProvided,
}) => {
    const [showModal, setShowModal] = useState(false);
    const [pendingSentiment, setPendingSentiment] = useState<boolean | null>(
        null
    );
    const [localSentiment, setLocalSentiment] = useState<boolean | null>(
        currentSentiment ?? null
    );
    const { toast } = useToaster();
    const [sendFeedback] = useSendFeedbackMutation();

    const handleFeedbackClick = useCallback(
        (sentiment: boolean) => {
            if (localSentiment !== null) {
                return; // Already provided feedback
            }
            setPendingSentiment(sentiment);
            setShowModal(true);
        },
        [localSentiment]
    );

    const handleModalSubmit = useCallback(
        async (comments: string) => {
            if (pendingSentiment === null) return;

            try {
                // Update local state immediately to disable buttons
                setLocalSentiment(pendingSentiment);
                setShowModal(false);

                // Log to Firebase
                LogEvent("human-feedback", {
                    humanSentiment: pendingSentiment.toString(),
                });

                // Send to GraphQL server
                await sendFeedback({
                    variables: {
                        input: {
                            messageId,
                            humanSentiment: pendingSentiment,
                            comments: comments || undefined,
                        },
                    },
                });

                // Notify parent component
                onFeedbackProvided?.(pendingSentiment);

                // Show success toast
                toast.success({
                    message: "Thank you for your feedback!",
                });
            } catch (error) {
                // Revert local state on error
                setLocalSentiment(null);
                console.error("Error sending feedback:", error);
                toast.danger({
                    message: "Failed to submit feedback. Please try again.",
                });
            } finally {
                setPendingSentiment(null);
            }
        },
        [pendingSentiment, messageId, sendFeedback, onFeedbackProvided, toast]
    );

    const handleModalHide = useCallback(() => {
        setShowModal(false);
        setPendingSentiment(null);
    }, []);

    // If sentiment already provided, show only that icon (not clickable)
    if (localSentiment !== null) {
        return (
            <div className="mt-2">
                <FontAwesomeIcon
                    icon={localSentiment ? faThumbsUp : faThumbsDown}
                    className={localSentiment ? "text-success" : "text-danger"}
                    size="lg"
                />
            </div>
        );
    }

    return (
        <>
            <div className="mt-2 d-flex gap-3">
                <FontAwesomeIcon
                    icon={faThumbsUpRegular}
                    className="text-secondary"
                    size="lg"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleFeedbackClick(true)}
                    role="button"
                    aria-label="Thumbs up"
                />
                <FontAwesomeIcon
                    icon={faThumbsDownRegular}
                    className="text-secondary"
                    size="lg"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleFeedbackClick(false)}
                    role="button"
                    aria-label="Thumbs down"
                />
            </div>
            {showModal && pendingSentiment !== null && (
                <FeedbackModal
                    show={showModal}
                    onSubmit={handleModalSubmit}
                    messageContent={messageContent}
                />
            )}
        </>
    );
};
