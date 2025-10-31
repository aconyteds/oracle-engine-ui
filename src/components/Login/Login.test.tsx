import { useUserContext } from "@context";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "../../test-utils";
import { Login } from "./Login";

// Mock Firebase Authentication Functions
vi.mock("../firebase", () => ({
    auth: {},
    googleProvider: {},
    LogEvent: vi.fn(),
}));
vi.mock("firebase/auth", () => ({
    signInWithEmailAndPassword: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn(),
    getAuth: vi.fn(() => ({})),
}));
vi.mock("../../apolloClient", () => ({
    default: {},
    setAuthToken: vi.fn(),
}));
vi.mock("@context");

describe("Login Component", () => {
    const mockUserContext = {
        isLoggedIn: false,
        setIsLoggedIn: vi.fn(),
        handleLogin: vi.fn(),
        currentUser: null,
        isActive: false,
        loading: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useUserContext).mockReturnValue(mockUserContext);
        vi.mocked(signInWithEmailAndPassword).mockReset();
        vi.mocked(signInWithPopup).mockReset();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    test("should render without crashing", () => {
        render(<Login />);
        expect(screen.getByTestId("login-form")).toBeInTheDocument();
    });

    test("should show registration options when VITE_ALLOW_REGISTRATION is true", () => {
        const { getByText } = render(<Login />, {
            env: { VITE_ALLOW_REGISTRATION: "true" },
        });

        expect(getByText("Email")).toBeInTheDocument();
        expect(getByText("Password")).toBeInTheDocument();
        expect(getByText("Register")).toBeInTheDocument();
        expect(getByText("Login")).toBeInTheDocument();
    });

    test("should hide registration options when VITE_ALLOW_REGISTRATION is false", () => {
        const { queryByText, getByText } = render(<Login />, {
            env: { VITE_ALLOW_REGISTRATION: "false" },
        });

        expect(queryByText("Email")).not.toBeInTheDocument();
        expect(queryByText("Password")).not.toBeInTheDocument();
        expect(queryByText("Register")).not.toBeInTheDocument();
        expect(queryByText("Login")).not.toBeInTheDocument();
        expect(getByText("Sign in with Google")).toBeInTheDocument();
    });

    test("should call Firebase signInWithEmailAndPassword on login", async () => {
        const mockSignin = vi.fn().mockResolvedValue({
            user: { uid: "mock-uid", email: "mock@example.com" },
        });
        vi.mocked(signInWithEmailAndPassword).mockImplementation(mockSignin);

        render(<Login />, { env: { VITE_ALLOW_REGISTRATION: "true" } });

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "password" },
        });

        await act(async () => {
            fireEvent.click(screen.getByText("Login"));
        });

        expect(mockSignin).toHaveBeenCalledWith(
            expect.anything(),
            "test@example.com",
            "password"
        );
    });

    test("should handle Google sign-in", async () => {
        const mockSetIsLoggedIn = vi.fn();
        vi.mocked(useUserContext).mockReturnValue({
            ...mockUserContext,
            setIsLoggedIn: mockSetIsLoggedIn,
        });

        const mockGoogleSignin = vi.fn().mockResolvedValue({
            user: {
                uid: "mock-uid",
                email: "mock@example.com",
                getIdToken: () => Promise.resolve("mock-token"),
            },
        });
        vi.mocked(signInWithPopup).mockImplementation(mockGoogleSignin);

        render(<Login />, { env: { VITE_ALLOW_REGISTRATION: "true" } });

        await act(async () => {
            fireEvent.click(screen.getByText("Sign in with Google"));
        });

        expect(mockGoogleSignin).toHaveBeenCalled();
        expect(mockSetIsLoggedIn).toHaveBeenCalled();
    });

    test("should display error message on login failure", async () => {
        vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
            new Error("Failed to login")
        );

        render(<Login />, { env: { VITE_ALLOW_REGISTRATION: "true" } });

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText("Email"), {
                target: { value: "test@example.com" },
            });
            fireEvent.change(screen.getByPlaceholderText("Password"), {
                target: { value: "password" },
            });
            fireEvent.click(screen.getByText("Login"));
        });

        expect(
            screen.getByText("Failed to log in. Please check your credentials.")
        ).toBeInTheDocument();
    });
});
