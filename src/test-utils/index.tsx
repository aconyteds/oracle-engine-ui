import React, { ReactNode } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router } from "react-router-dom";
import { render, RenderOptions } from "@testing-library/react";
import { vi } from "vitest";

// Mock `useNavigate` hook
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(), // Mocked navigate function
  };
});

interface WrapperProps {
  children: ReactNode;
}

// Universal wrapper component
const AllProviders: React.FC<WrapperProps> = ({ children }) => {
  return (
    <ChakraProvider>
      <Router>{children}</Router>
    </ChakraProvider>
  );
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
    (import.meta.env as any)[key] = value;
  }

  return render(ui, { wrapper: AllProviders, ...options });
};

export * from "@testing-library/react";
export { customRender as render };
