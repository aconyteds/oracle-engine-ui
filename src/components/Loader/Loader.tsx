import React from "react";
import { Spinner } from "react-bootstrap";

export const Loader: React.FC = () => {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
        >
            <Spinner />
            <span className="ms-1">Loading...</span>
        </div>
    );
};
