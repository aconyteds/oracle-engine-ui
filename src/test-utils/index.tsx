import { RenderOptions, render } from "@testing-library/react";
import React, { ReactNode } from "react";
import { BrowserRouter as Router } from "react-router-dom";

interface WrapperProps {
    children: ReactNode;
}

// Universal wrapper component
const AllProviders: React.FC<WrapperProps> = ({ children }) => {
    return <Router>{children}</Router>;
};

// Custom render function to use across tests
const customRender = (
    ui: React.ReactElement,
    {
        env = {},
        ...options
    }: RenderOptions & { env?: Record<string, string> } = {}
) => {
    // Override environment variables
    for (const [key, value] of Object.entries(env)) {
        (import.meta.env as Record<string, string | undefined>)[key] = value;
    }

    return render(ui, { wrapper: AllProviders, ...options });
};

export * from "@testing-library/react";
export { customRender as render };
