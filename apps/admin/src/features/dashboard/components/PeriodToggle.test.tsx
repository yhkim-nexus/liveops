import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PeriodToggle } from "./PeriodToggle";

describe("PeriodToggle", () => {
  it("renders all 3 period options", () => {
    render(<PeriodToggle value="30d" onChange={() => {}} />);
    expect(screen.getByText("7D")).toBeInTheDocument();
    expect(screen.getByText("30D")).toBeInTheDocument();
    expect(screen.getByText("90D")).toBeInTheDocument();
  });

  it("calls onChange with the clicked period", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PeriodToggle value="30d" onChange={onChange} />);

    await user.click(screen.getByText("7D"));
    expect(onChange).toHaveBeenCalledWith("7d");

    await user.click(screen.getByText("90D"));
    expect(onChange).toHaveBeenCalledWith("90d");
  });
});
