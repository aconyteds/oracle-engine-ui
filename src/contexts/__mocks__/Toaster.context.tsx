import React from "react";
import { vi } from "vitest";

const mockToastFunctions = {
    success: vi.fn(),
    danger: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
};

export const useToaster = vi.fn(() => ({
    toast: mockToastFunctions,
}));

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    return <>{children}</>;
};

// Export the mock functions for test manipulation
export const mockToaster = {
    ...mockToastFunctions,
    reset: () => {
        Object.values(mockToastFunctions).forEach((mock) => mock.mockClear());
        useToaster.mockClear();
    },
};
