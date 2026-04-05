import React from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "./card";
import { defaultTheme } from "./theme";

describe("Card", () => {
  it("renders with default props", () => {
    render(<Card>Test Content</Card>);
    const card = screen.getByText("Test Content").closest(".MuiCard-root");
    expect(card).toBeInTheDocument();
  });

  it("renders with header", () => {
    const header = "Card Header";
    render(<Card header={header}>Test Content</Card>);
    expect(screen.getByText(header)).toBeInTheDocument();
  });

  it("renders with footer", () => {
    const footer = "Card Footer";
    render(<Card footer={footer}>Test Content</Card>);
    expect(screen.getByText(footer)).toBeInTheDocument();
  });

  it("renders with outlined variant", () => {
    render(<Card variant="outlined">Test Content</Card>);
    const card = screen.getByText("Test Content").closest(".MuiCard-root");
    expect(card).toBeInTheDocument();
  });

  it("renders with elevated variant", () => {
    render(<Card variant="elevated">Test Content</Card>);
    const card = screen.getByText("Test Content").closest(".MuiCard-root");
    expect(card).toBeInTheDocument();
  });

  it("renders with custom theme", () => {
    const customTheme = {
      ...defaultTheme,
      variants: {
        ...defaultTheme.variants,
        default: {
          ...defaultTheme.variants.default,
          background: "#f0f0f0",
          borderColor: "#cccccc",
          shadow: "0 0 10px rgba(0, 0, 0, 0.1)"}}};

    render(<Card theme={customTheme}>Test Content</Card>);
    const card = screen.getByText("Test Content").closest(".MuiCard-root");
    expect(card).toBeInTheDocument();
  });
});
