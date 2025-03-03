import { vi } from "vitest";

// Mock the setAuthToken function
export const setAuthToken = vi.fn();

// Create a mock Apollo Client instance
const mockApolloClient = {
    query: vi.fn(),
    mutate: vi.fn(),
    subscribe: vi.fn(),
    watchQuery: vi.fn(),
    cache: {
        extract: vi.fn(),
        restore: vi.fn(),
        reset: vi.fn(),
        readQuery: vi.fn(),
        writeQuery: vi.fn(),
        readFragment: vi.fn(),
        writeFragment: vi.fn(),
    },
};

// Export the mock client as default, maintaining the module structure
export default {
    __esModule: true,
    default: mockApolloClient,
};
