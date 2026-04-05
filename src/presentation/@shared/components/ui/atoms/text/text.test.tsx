import React from "react";
import { render, screen } from "@testing-library/react";
import { Text } from "./text";
import { defaultTheme } from "./theme";
import { ThemeModeProvider } from "../../../../contexts/theme-mode-context";

describe("Text", () => {
  const renderWithProvider = (ui: React.ReactNode) =>
    render(<ThemeModeProvider initialMode="dark">{ui}</ThemeModeProvider>);

  it("renders with default props", () => {
    renderWithProvider(<Text>Test Content</Text>);
    const text = screen.getByText("Test Content");
    expect(text).toBeInTheDocument();
    expect(text.tagName.toLowerCase()).toBe("p");
  });

  it("renders with different variants", () => {
    const { rerender } = renderWithProvider(<Text variant="h1">Heading 1</Text>);
    expect(screen.getByText("Heading 1").tagName.toLowerCase()).toBe("h1");

    rerender(
      <ThemeModeProvider initialMode="dark">
        <Text variant="h2">Heading 2</Text>
      </ThemeModeProvider>
    );
    expect(screen.getByText("Heading 2").tagName.toLowerCase()).toBe("h2");

    rerender(
      <ThemeModeProvider initialMode="dark">
        <Text variant="span" component="span">Inline Text</Text>
      </ThemeModeProvider>
    );
    expect(screen.getByText("Inline Text").tagName.toLowerCase()).toBe("span");

    rerender(
      <ThemeModeProvider initialMode="dark">
        <Text variant="label">Label Text</Text>
      </ThemeModeProvider>
    );
    expect(screen.getByText("Label Text").tagName.toLowerCase()).toBe("label");
  });

  it("renders with different alignments", () => {
    renderWithProvider(<Text align="center">Centered Text</Text>);
    expect(screen.getByText("Centered Text")).toHaveStyle({
      textAlign: "center"});

    renderWithProvider(<Text align="right">Right Aligned Text</Text>);
    expect(screen.getByText("Right Aligned Text")).toHaveStyle({
      textAlign: "right"});
  });

  it("renders with different weights", () => {
    renderWithProvider(<Text weight="bold">Bold Text</Text>);
    expect(screen.getByText("Bold Text")).toHaveStyle({ fontWeight: "700" });

    renderWithProvider(<Text weight="medium">Medium Text</Text>);
    expect(screen.getByText("Medium Text")).toHaveStyle({ fontWeight: "500" });
  });

  it("renders with custom theme", () => {
    const customTheme = {
      ...defaultTheme,
      variants: {
        ...defaultTheme.variants,
        p: {
          ...defaultTheme.variants.p,
          fontSize: "1.25rem",
          color: "#ff0000"}}};

    renderWithProvider(<Text theme={customTheme}>Custom Themed Text</Text>);
    const text = screen.getByText("Custom Themed Text");
    expect(text).toHaveStyle({
      fontSize: customTheme.variants.p.fontSize,
      color: customTheme.variants.p.color});
  });

  it("applies additional className", () => {
    renderWithProvider(<Text className="custom-class">Text with Custom Class</Text>);
    expect(screen.getByText("Text with Custom Class")).toHaveClass("custom-class");
  });
});
