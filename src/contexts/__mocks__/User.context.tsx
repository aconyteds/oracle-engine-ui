import { vi } from "vitest";

const mockUserContext = {
    isLoggedIn: false,
    setIsLoggedIn: vi.fn(),
    handleLogin: vi.fn(),
};

export const useUserContext = vi.fn(() => mockUserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    return <>{children}</>;
};
