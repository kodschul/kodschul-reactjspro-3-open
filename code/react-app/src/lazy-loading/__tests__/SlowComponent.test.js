import { render, screen, fireEvent } from "@testing-library/react";
import SlowComponent from "../SlowComponent";

describe("Slow Component unit", () => {
  test("renders slow components", () => {
    render(<SlowComponent />);
    const linkElement = screen.getByText(/SlowComponent/i);
    expect(linkElement).toBeInTheDocument();
  });

  test("has button", async () => {
    render(<SlowComponent />);
    expect(screen.getByText("SlowComponent")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Toggle"));

    const notFoundElement = await screen.queryAllByText("SlowComponent");
    expect(notFoundElement.length).toBeFalsy();
  });
});
