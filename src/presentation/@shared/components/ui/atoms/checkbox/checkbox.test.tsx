import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "./checkbox";
import { defaultTheme } from "./theme";

describe("Checkbox", () => {
  it("renders with default props", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  it("renders with label", () => {
    const label = "Test Checkbox";
    render(<Checkbox label={label} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("renders with error state", () => {
    render(<Checkbox state="error" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  it("renders with success state", () => {
    render(<Checkbox state="success" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  it("renders with disabled state", () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("handles onChange event", () => {
    const handleChange = jest.fn();
    render(<Checkbox onChange={handleChange} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("renders with custom theme", () => {
    const customTheme = {
      ...defaultTheme,
      states: {
        ...defaultTheme.states,
        default: {
          ...defaultTheme.states.default,
          background: "#f0f0f0",
          color: "#333333",
          borderColor: "#cccccc",
          focusBorderColor: "#666666",
          focusBoxShadow: "0 0 0 0.2rem rgba(102, 102, 102, 0.25)",
          checkedBackground: "#666666",
          checkedBorderColor: "#666666"}}};

    render(<Checkbox theme={customTheme} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });
});
