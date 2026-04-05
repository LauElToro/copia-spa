import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Radio } from "./radio";

describe("Radio", () => {
  const defaultProps = {
    name: "test-radio",
    value: "test-value"};

  it("renders with default props", () => {
    render(<Radio {...defaultProps} />);
    const radio = screen.getByRole("radio");
    expect(radio).toBeInTheDocument();
  });

  it("renders with label", () => {
    const label = "Test Radio";
    render(<Radio {...defaultProps} label={label} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("renders with checked state", () => {
    render(<Radio {...defaultProps} state="checked" checked />);
    const radio = screen.getByRole("radio");
    expect(radio).toBeInTheDocument();
    expect(radio).toBeChecked();
  });

  it("renders with disabled state", () => {
    render(<Radio {...defaultProps} state="disabled" disabled />);
    const radio = screen.getByRole("radio");
    expect(radio).toBeDisabled();
  });

  it("handles onChange event", () => {
    const handleChange = jest.fn();
    render(<Radio {...defaultProps} onChange={handleChange} />);
    const radio = screen.getByRole("radio");
    fireEvent.click(radio);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("renders with custom theme", () => {
    const customTheme = {
      states: {
        default: {
          background: "#f0f0f0",
          color: "#333333",
          borderColor: "#cccccc"},
        checked: {
          background: "#ffffff",
          color: "#000000",
          borderColor: "#007bff"},
        disabled: {
          background: "#f8f9fa",
          color: "#6c757d",
          borderColor: "#dee2e6"}}};

    render(<Radio {...defaultProps} theme={customTheme} />);
    const radio = screen.getByRole("radio");
    expect(radio).toBeInTheDocument();
  });
});
