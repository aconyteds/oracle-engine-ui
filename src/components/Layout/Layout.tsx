import React from "react";
import { Main } from "./Main";
import { Header } from "./Header";
import { LeftPanel } from "./LeftPanel";
import "./Layout.scss";

export const Layout: React.FC = () => {
    return (
        <div className="root-container">
            <div className="header-container">
                <Header />
            </div>
            <div className="content-container">
                <LeftPanel />
                <div className="main-panel">
                    <Main />
                </div>
            </div>
        </div>
    );
};
