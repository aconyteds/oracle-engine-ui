import { RenderOptions, render } from "@testing-library/react";
import React, { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { ToasterProvider } from "../contexts";

// Custom render function to use across tests
// Uses MemoryRouter with v7 future flags to prevent migration warnings
const customRender = (
    ui: React.ReactElement,
    {
        env = {},
        initialEntries = ["/"],
        ...options
    }: RenderOptions & {
        env?: Record<string, string>;
        initialEntries?: string[];
    } = {}
) => {
    // Override environment variables
    for (const [key, value] of Object.entries(env)) {
        (import.meta.env as Record<string, string | undefined>)[key] = value;
    }

    // Custom wrapper with optional initial route
    const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
        <ToasterProvider>
            <MemoryRouter
                initialEntries={initialEntries}
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                {children}
            </MemoryRouter>
        </ToasterProvider>
    );

    return render(ui, { wrapper: Wrapper, ...options });
};

export * from "@testing-library/react";
export { customRender as render };
