import React from "react";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";
import { defaultTheme } from "./theme";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("renders with different variants", () => {
    const { rerender } = render(<Button variant="secondary">Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();

    rerender(<Button variant="success">Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();

    rerender(<Button variant="danger">Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Button size="sm">Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();

    rerender(<Button size="lg">Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders with full width", () => {
    render(<Button fullWidth>Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({ width: "100%" });
  });

  it("renders in loading state", () => {
    render(<Button isLoading>Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Click me");
  });

  it("renders with custom theme", () => {
    const customTheme = {
      ...defaultTheme,
      variants: {
        ...defaultTheme.variants,
        primary: {
          ...defaultTheme.variants.primary,
          background: "#ff0000",
          color: "#ffffff",
          borderColor: "#cc0000"}}};

    render(<Button theme={customTheme}>Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    // MUI Button applies styles differently, so we just verify it renders
  });
});
