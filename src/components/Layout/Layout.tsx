import { useLocalStorage } from "@hooks";
import React, { lazy, Suspense, useCallback } from "react";
import { CampaignModal } from "../Campaign";
import { ResizablePanel } from "../Common";
import { HealthCheck } from "../HealthCheck";
import { INTRO_MODAL_FLAG } from "../Introduction";
import { UsageIndicator } from "../UsageIndicator";
import { ChatPanel } from "./ChatPanel";
import { Header } from "./Header";
import { Main } from "./Main";
import "./Layout.scss";

const IntroductionModal = lazy(() =>
    import("../Introduction/IntroductionModal").then((module) => ({
        default: module.IntroductionModal,
    }))
);

export const Layout: React.FC = () => {
    const [hasSeenIntro, setHasSeenIntro] = useLocalStorage(
        INTRO_MODAL_FLAG,
        false
    );

    const handleShowIntro = useCallback(() => {
        setHasSeenIntro(false);
    }, [setHasSeenIntro]);

    const handleCloseIntro = useCallback(() => {
        setHasSeenIntro(true);
    }, [setHasSeenIntro]);

    return (
        <div className="root-container">
            <div className="header-container">
                <Header onShowIntro={handleShowIntro} />
            </div>
            <div className="content-container">
                <ResizablePanel
                    id="layout-chat-panel"
                    leftPanel={
                        <div className="chat-panel-container">
                            <ChatPanel />
                            <div className="chat-panel-footer">
                                <HealthCheck />
                                <UsageIndicator />
                            </div>
                        </div>
                    }
                >
                    <Main />
                </ResizablePanel>
            </div>
            <CampaignModal />
            {!hasSeenIntro && (
                <Suspense fallback={null}>
                    <IntroductionModal show onClose={handleCloseIntro} />
                </Suspense>
            )}
        </div>
    );
};
