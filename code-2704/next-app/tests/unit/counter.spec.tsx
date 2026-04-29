import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import CounterComponent from "@/app/state/page";

describe("Counter", () => {
  beforeAll(() => {
    userEvent.setup();
  });
  it("should render", () => {
    render(<CounterComponent />);

    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });
});
