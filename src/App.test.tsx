import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";
import { LogEvent } from "./components/firebase";

vi.mock("./firebase", () => ({
  LogEvent: vi.fn(),
}));

describe("App Component", () => {
  it("Loads the initial component", () => {
    render(<App />);
    expect(true).toBe(true);
  });
  it("renders the App component", () => {
    render(<App />);
    expect(screen.getByText("count is 0")).toBeInTheDocument();
  });

  it("calls LogEvent on load", () => {
    render(<App />);
    expect(LogEvent).toHaveBeenCalledWith("load");
  });
});
