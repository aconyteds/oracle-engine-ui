import React from "react";
import { Main } from "./Main";
import { Header } from "./Header";
import { ChatPanel } from "./ChatPanel";
import { ResizablePanel } from "../Common";
import { HealthCheck } from "../HealthCheck";
import "./Layout.scss";

export const Layout: React.FC = () => {
    return (
        <div className="root-container">
            <div className="header-container">
                <Header />
            </div>
            <div className="content-container">
                <ResizablePanel
                    leftPanel={
                        <div className="chat-panel-container">
                            <ChatPanel />
                            <div className="chat-panel-footer">
                                <HealthCheck />
                            </div>
                        </div>
                    }
                >
                    <Main />
                </ResizablePanel>
            </div>
        </div>
    );
};
