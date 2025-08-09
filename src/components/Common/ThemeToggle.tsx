import React from "react";
import { Button, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSun,
    faMoon,
    faDesktop,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../../hooks/useTheme";

export const ThemeToggle: React.FC = () => {
    const { theme, mode, setMode } = useTheme();

    const getIcon = () => {
        if (mode === "system") return faDesktop;
        return theme === "dark" ? faMoon : faSun;
    };

    const getLabel = () => {
        if (mode === "system") return "System";
        return theme === "dark" ? "Dark" : "Light";
    };

    return (
        <Dropdown>
            <Dropdown.Toggle
                as={Button}
                variant="outline-primary"
                size="sm"
                className="d-flex align-items-center gap-2"
                bsPrefix="btn"
            >
                <FontAwesomeIcon icon={getIcon()} />
                <span className="d-none d-md-inline">{getLabel()}</span>
                <FontAwesomeIcon icon={faChevronDown} size="xs" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item
                    active={mode === "light"}
                    onClick={() => setMode("light")}
                >
                    <FontAwesomeIcon icon={faSun} className="me-2" />
                    Light
                </Dropdown.Item>
                <Dropdown.Item
                    active={mode === "dark"}
                    onClick={() => setMode("dark")}
                >
                    <FontAwesomeIcon icon={faMoon} className="me-2" />
                    Dark
                </Dropdown.Item>
                <Dropdown.Item
                    active={mode === "system"}
                    onClick={() => setMode("system")}
                >
                    <FontAwesomeIcon icon={faDesktop} className="me-2" />
                    System
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};
