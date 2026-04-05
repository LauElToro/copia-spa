import React from "react";
import { render, screen } from "@testing-library/react";
import { Input } from "./input";
import { defaultTheme } from "./theme";

describe("Input", () => {
  it("renders with default props", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("renders with custom type", () => {
    render(<Input type="email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
  });

  it("renders with error state", () => {
    render(<Input state="error" />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("renders with success state", () => {
    render(<Input state="success" />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("renders with disabled state", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
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
          placeholderColor: "#999999",
          focusBorderColor: "#666666",
          focusBoxShadow: "0 0 0 0.2rem rgba(102, 102, 102, 0.25)"}}};

    render(<Input theme={customTheme} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });
});
