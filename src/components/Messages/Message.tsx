import React, { useMemo, useState } from "react";
import { MarkdownRenderer } from "../Common";
import "./Message.scss";
import {
    faChevronDown,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collapse, ListGroup, ListGroupItem } from "react-bootstrap";
import { useUserContext } from "@/contexts";
import { useToggle } from "@/hooks";
import {
    MessageWorkspaceFragment,
    ResponseType,
} from "../../graphql/generated";
import { FeedbackButtons } from "./FeedbackButtons";

type MessageProps = {
    id: string;
    role: string;
    content: string;
    workspace?: Array<MessageWorkspaceFragment>;
    humanSentiment?: boolean | null;
};

export const Message: React.FC<MessageProps> = ({
    content,
    role,
    id,
    workspace,
    humanSentiment,
}) => {
    const [showWorkspace, setShowWorkspace] = useToggle();
    const { showDebug } = useUserContext();
    const isUser = role.toLowerCase() === "user";
    const isAssistant = role.toLowerCase() === "assistant";
    const [localSentiment, setLocalSentiment] = useState<boolean | null>(
        humanSentiment ?? null
    );

    const workspaceContent = useMemo(() => {
        return (
            workspace
                ?.filter(
                    ({ messageType }) =>
                        showDebug || messageType === ResponseType.Intermediate
                )
                .map((workspaceItem, indx) => {
                    return (
                        <ListGroupItem
                            key={
                                workspaceItem.messageType +
                                "-" +
                                indx.toString()
                            }
                            className="message-workspace pt-1 pb-0 rounded-0 border-top-0 text-muted small bg-dark"
                        >
                            <h6 className="message-workspace-role fw-bold d-block mb-2 small text-uppercase">
                                {workspaceItem.messageType}
                            </h6>
                            <div className="message-workspace-content font-handwriting">
                                <MarkdownRenderer
                                    content={workspaceItem.content}
                                />
                            </div>
                        </ListGroupItem>
                    );
                }) || []
        );
    }, [workspace, showDebug]);

    const showWorkspaceButton = isAssistant && workspaceContent.length > 0;

    return (
        <div key={id} className="mb-3">
            <div
                className={`message p-3 rounded shadow-sm border ${
                    isUser
                        ? "bg-primary-subtle text-white border-primary-subtle"
                        : isAssistant
                          ? "bg-light-subtle border-light-subtle"
                          : "bg-secondary-subtle border-secondary-subtle"
                }`}
                style={{
                    maxWidth: "85%",
                    marginLeft: isUser ? "auto" : "0",
                    marginRight: isUser ? "0" : "auto",
                }}
            >
                <span
                    className={`message-role fw-bold d-block mb-2 small text-uppercase ${
                        isUser ? "text-white opacity-75" : "text-body-secondary"
                    }`}
                >
                    {role}
                </span>
                {showWorkspaceButton && (
                    <div
                        className={`workspace-header d-flex justify-content-between align-items-center p-2 rounded border border-light-subtle ${
                            showWorkspace
                                ? "rounded-bottom-0 bg-body border-2"
                                : "border-1"
                        }`}
                        onClick={setShowWorkspace}
                        role="button"
                        aria-expanded={showWorkspace}
                    >
                        <h6 className="fw-bold small text-uppercase mb-0">
                            Show Work
                        </h6>
                        <FontAwesomeIcon
                            icon={
                                showWorkspace ? faChevronDown : faChevronRight
                            }
                            size="sm"
                        />
                    </div>
                )}
                <Collapse in={showWorkspace}>
                    <ListGroup className="mb-3 rounded-top-0 border-top-0 border-light-subtle">
                        {workspaceContent}
                    </ListGroup>
                </Collapse>
                <div
                    className={`message-content ${
                        isUser ? "text-white" : "text-body"
                    } mt-3`}
                >
                    <MarkdownRenderer content={content} />
                </div>
                {isAssistant && (
                    <>
                        <hr style={{ margin: "1rem -1rem" }} />
                        <FeedbackButtons
                            messageId={id}
                            messageContent={content}
                            currentSentiment={localSentiment}
                            onFeedbackProvided={setLocalSentiment}
                        />
                    </>
                )}
            </div>
        </div>
    );
};
