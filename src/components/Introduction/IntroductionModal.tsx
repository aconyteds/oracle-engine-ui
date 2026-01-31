import { useLocalStorage } from "@hooks";
import React, { useCallback, useState } from "react";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { HoldConfirmButton } from "../Common";
import "./IntroductionModal.scss";
import chatImg from "../../assets/chat_optimized.webp";
import assetImg from "../../assets/npc_asset_optimized.webp";
import welcomeImg from "../../assets/oracle_engine_optimized.webp";
import searchImg from "../../assets/recent_work_chat_optimized.webp";

type IntroStep = {
    title: string;
    content: React.ReactNode;
    image: string;
};

const introSteps: IntroStep[] = [
    {
        title: "Welcome to Oracle Engine",
        image: welcomeImg,
        content: (
            <>
                <p>
                    Your AI-powered campaign companion for creating, finding,
                    and managing everything in your TTRPG world.
                </p>
                <p>Three things you can do right now:</p>
                <ul>
                    <li>
                        <strong>Ask the Oracle</strong> — "Give me plot hooks
                        for a Prison Escape"
                    </li>
                    <li>
                        <strong>Search your world</strong> — Find that NPC whose
                        name you forgot
                    </li>
                    <li>
                        <strong>Build assets</strong> — Create NPCs, locations,
                        and plots with AI assistance
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "Work With the Oracle",
        image: chatImg,
        content: (
            <>
                <p>
                    The chat panel is your primary interface. Ask questions,
                    request content, or explore your world.
                </p>
                <p>Try prompts like:</p>
                <ul>
                    <li className="fst-italic">
                        "Create five NPCs for a bustling market district"
                    </li>
                    <li className="fst-italic">
                        "Generate a mysterious forest location"
                    </li>
                    <li className="fst-italic">
                        "Outline a heist plot involving a royal treasury"
                    </li>
                </ul>
                <p>
                    The Oracle knows your campaign's setting, tone, and ruleset.
                    It references assets you've created and can build new ones
                    on request.
                </p>
                <p>
                    Use <strong>Show Work</strong> to see the agent's reasoning
                    and tool calls.
                </p>
            </>
        ),
    },
    {
        title: "Manage Your World",
        image: assetImg,
        content: (
            <>
                <p>
                    Everything you create lives in Manage Assets: NPCs,
                    Locations, Points of Interest, and Plots.
                </p>
                <p>Each asset has two sections:</p>
                <div className="ms-3">
                    <p>
                        <strong>GM Information</strong> — Secrets, motivations,
                        and notes only you see
                    </p>
                    <p>
                        <strong>Player Information</strong> — Details safe to
                        share at the table
                    </p>
                </div>
                <p>
                    Assets open as windows you can move, minimize, or close.
                    Toggle between <strong>Edit</strong> and{" "}
                    <strong>View</strong> mode using the icon in the window
                    header.
                </p>
                <p>
                    <strong>Read Aloud</strong> sections give you boxed text
                    ready to narrate when players arrive at a location or meet
                    an NPC.
                </p>
            </>
        ),
    },
    {
        title: "Find Anything, Add Context",
        image: searchImg,
        content: (
            <>
                <p>
                    Use the search bar to find assets by name or description.
                    Filter by type using the dropdown, or search across
                    everything at once.
                </p>
                <p>You can also ask the Oracle to search for you:</p>
                <ul>
                    <li className="fst-italic">
                        "What do I have on the Western Well?"
                    </li>
                    <li className="fst-italic">
                        "Find NPCs connected to inter dimensional cults"
                    </li>
                    <li className="fst-italic">
                        "What has Tomas 'Scrap' Veller been involved in?"
                    </li>
                </ul>
                <p>
                    The Oracle will find relevant assets, summarize them, and
                    link you directly to the full details.
                </p>
                <p>
                    As your campaign evolves, update your assets directly or ask
                    the Oracle to add new details for you.
                </p>
            </>
        ),
    },
];

export const INTRO_MODAL_FLAG = "hasSeenIntroduction";

type IntroductionModalProps = {
    show: boolean;
    onClose: () => void;
};

export const IntroductionModal: React.FC<IntroductionModalProps> = ({
    show,
    onClose,
}) => {
    const [, setHasSeenIntro] = useLocalStorage(INTRO_MODAL_FLAG, false);
    const [currentStep, setCurrentStep] = useState(0);

    const handleClose = useCallback(() => {
        setHasSeenIntro(true);
        onClose();
    }, [setHasSeenIntro, onClose]);

    const handleDotClick = useCallback((index: number) => {
        setCurrentStep(index);
    }, []);

    const handleNext = useCallback(() => {
        if (currentStep < introSteps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            setHasSeenIntro(true);
            onClose();
        }
    }, [currentStep, setHasSeenIntro, onClose]);

    const handleBack = useCallback(() => {
        setCurrentStep((prev) => {
            return Math.max(0, prev - 1);
        });
    }, []);

    const isLastStep = currentStep === introSteps.length - 1;
    const step = introSteps[currentStep];

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="xl"
            className="introduction-modal"
            backdrop="static"
        >
            <Modal.Header closeButton>
                <Modal.Title>Introduction</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h2 className="mb-4">{step.title}</h2>
                <div className="introduction-content">
                    <div className="introduction-text">{step.content}</div>
                    <div className="introduction-image">
                        <img src={step.image} alt={step.title} />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="introduction-footer">
                <div className="footer-left">
                    {currentStep !== 0 && (
                        <Button
                            variant="outline-secondary"
                            onClick={handleBack}
                        >
                            Back
                        </Button>
                    )}
                </div>
                <div className="introduction-dots">
                    {introSteps.map((introStep, index) => (
                        <OverlayTrigger
                            key={index}
                            placement="top"
                            overlay={
                                <Tooltip id={`intro-dot-${index}`}>
                                    {introStep.title}
                                </Tooltip>
                            }
                        >
                            <button
                                type="button"
                                className={`dot ${index === currentStep ? "active" : ""}`}
                                onClick={() => handleDotClick(index)}
                                aria-label={`Go to ${introStep.title}`}
                            />
                        </OverlayTrigger>
                    ))}
                </div>
                <div className="footer-right">
                    <Button
                        variant={isLastStep ? "success" : "primary"}
                        onClick={handleNext}
                    >
                        {isLastStep ? "Get Started" : "Next"}
                    </Button>
                    {!isLastStep && (
                        <HoldConfirmButton
                            variant="outline-secondary"
                            onConfirm={handleClose}
                            holdDuration={1000}
                        >
                            Skip
                        </HoldConfirmButton>
                    )}
                </div>
            </Modal.Footer>
        </Modal>
    );
};
