import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";
import { LogEvent } from "./components/firebase";

vi.mock("./components/firebase", async (importOriginal) => {
  const actual =
    (await importOriginal()) as typeof import("./components/firebase");
  return {
    ...actual,
    LogEvent: vi.fn(),
  };
});
vi.mock("./components/Router");
vi.mock("./components/Login");

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Ensure all mocks are cleared before each test
  });

  it("Loads the initial component", () => {
    render(<App />);
    expect(true).toBe(true); // Basic assertion to ensure App loads
  });

  it("calls LogEvent on load", () => {
    render(<App />);
    expect(LogEvent).toHaveBeenCalledWith("load");
  });
});
