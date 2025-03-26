import { fireEvent, render, screen } from "@testing-library/react";
import Counter from "../pages/counter";
import { act } from "react";

describe("Counter", () => {
  it.skip("should render the component", () => {
    const { container } = render(<Counter />);
    expect(container).toMatchSnapshot();
  });

  it("should increment the count by 1", () => {
    const { getByTestId } = render(<Counter />);
    const button = screen.getByText(/count is 0/i);

    fireEvent.click(button);

    const btn2 = screen.getByText("count is 1");

    expect(screen.getByText("count is 1")).toBeDefined();
  });
});
