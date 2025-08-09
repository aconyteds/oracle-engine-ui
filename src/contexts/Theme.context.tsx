import React, { createContext, useEffect, useState } from "react";
import { useLocalStorage } from "@hooks";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextProps {
    theme: "light" | "dark";
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export { ThemeContext };

const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [mode, setMode] = useLocalStorage<ThemeMode>("theme-mode", "system");
    const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
        getSystemTheme()
    );

    const theme = mode === "system" ? systemTheme : mode;

    // Listen for system theme changes
    useEffect(() => {
        if (typeof window === "undefined") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute("data-bs-theme", theme);
        document.body.className =
            theme === "dark" ? "theme-dark" : "theme-light";
    }, [theme]);

    const toggleTheme = () => {
        if (mode === "system") {
            setMode(systemTheme === "dark" ? "light" : "dark");
        } else {
            setMode(theme === "dark" ? "light" : "dark");
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, mode, setMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
