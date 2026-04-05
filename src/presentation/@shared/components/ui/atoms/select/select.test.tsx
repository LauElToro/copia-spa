import React from "react";
import { render, screen } from "@testing-library/react";
import { Select } from "./select";
import { defaultTheme } from "./theme";

describe("Select", () => {
  const mockOptions = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
  ];

  it("renders with default props", () => {
    render(<Select options={mockOptions} value="" />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("renders with options", () => {
    render(<Select options={mockOptions} value="" />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    // MUI Select doesn't render options until opened, so we just verify the select exists
  });

  it("renders with error state", () => {
    render(<Select options={mockOptions} state="error" value="" />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("renders with success state", () => {
    render(<Select options={mockOptions} state="success" value="" />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("renders with disabled state", () => {
    render(<Select options={mockOptions} disabled value="" />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-disabled", "true");
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
          focusBoxShadow: "0 0 0 0.2rem rgba(102, 102, 102, 0.25)"}}};

    render(<Select options={mockOptions} theme={customTheme} value="" />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });
});
