import React from "react";
import { CampaignModal } from "../Campaign";
import { ResizablePanel } from "../Common";
import { HealthCheck } from "../HealthCheck";
import { UsageIndicator } from "../UsageIndicator";
import { ChatPanel } from "./ChatPanel";
import { Header } from "./Header";
import { Main } from "./Main";
import "./Layout.scss";

export const Layout: React.FC = () => {
    return (
        <div className="root-container">
            <div className="header-container">
                <Header />
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
        </div>
    );
};
