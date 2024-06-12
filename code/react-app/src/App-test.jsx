import { render, screen } from "@testing-library/react";
import App, { Counter } from "./state/use-state";

describe("App", () => {
  test("renders learn react link", () => {
    render(<App />);
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
  });

  test("shows default counter", () => {
    render(<Counter />);

    // const defaultValue = screen.findAllByTestId("")
  });
});
