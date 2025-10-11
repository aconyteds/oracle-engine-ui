import React from "react";
import "./Main.scss";

export const Main: React.FC = () => {
    return (
        <div className="display-area">
            <div className="display-content">
                {/* This area is reserved for modals and other display elements */}
                {/* Modals can be dragged around in this relatively positioned space */}
            </div>
        </div>
    );
};
