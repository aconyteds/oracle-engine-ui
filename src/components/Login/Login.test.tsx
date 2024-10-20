import { describe, it, expect, vi } from "vitest";
import { Login } from "./Login";
import { fireEvent, screen, render, act } from "../../test-utils";
import { signInWithEmailAndPassword } from "firebase/auth";

// Mock Firebase Authentication Functions
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock("../firebase");

describe("Login Component", () => {
  it("should show registration options when VITE_ALLOW_REGISTRATION is true", async () => {
    render(<Login />, { env: { VITE_ALLOW_REGISTRATION: "true" } });

    // Verify that the registration button is visible
    const registerButton = screen.getByText("Register");
    expect(registerButton).toBeInTheDocument();
  });

  it("should hide registration options when VITE_ALLOW_REGISTRATION is false", async () => {
    render(<Login />, { env: { VITE_ALLOW_REGISTRATION: "false" } });

    // Verify that the registration button is not visible
    const registerButton = screen.queryByText("Register");
    expect(registerButton).toBeNull();
  });

  it("should call Firebase signInWithEmailAndPassword on login", async () => {
    const mockSignin = vi.fn().mockResolvedValue({
      user: { uid: "mock-uid", email: "mock@example.com" },
    });
    vi.mocked(signInWithEmailAndPassword).mockImplementation(mockSignin);

    render(<Login />, { env: { VITE_ALLOW_REGISTRATION: "true" } });

    // Simulate user input
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });

    // Simulate clicking login button
    const loginButton = screen.getByText("Login");
    await act(async () => {
      fireEvent.click(loginButton);
    });

    // Check if Firebase mock function was called
    expect(mockSignin).toHaveBeenCalledWith(
      expect.anything(),
      "test@example.com",
      "password"
    );
  });
});
