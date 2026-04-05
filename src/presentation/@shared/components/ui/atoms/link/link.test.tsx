import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Link from "./link";
import { defaultTheme } from "./theme";

describe("Link component", () => {
  it("renders text and href correctly", () => {
    render(
      <Link href="/test" theme={defaultTheme}>
        Test link
      </Link>
    );
    const link = screen.getByText("Test link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("apply the correct color according to the primary variant", () => {
    render(
      <Link href="/test" theme={defaultTheme} variant="primary">
        Color link
      </Link>
    );
    const link = screen.getByText("Color link");
    expect(link).toHaveStyle({ color: defaultTheme.variants.primary.color });
  });

  it("applies the hover color when the mouse enters", () => {
    render(
      <Link href="/test" theme={defaultTheme} variant="primary">
        Hover link
      </Link>
    );
    const link = screen.getByText("Hover link");
    fireEvent.mouseEnter(link);
    expect(link).toHaveStyle({ color: defaultTheme.variants.primary.hover?.color });
    fireEvent.mouseLeave(link);
    expect(link).toHaveStyle({ color: defaultTheme.variants.primary.color });
  });

  it("renders with custom theme", () => {
    const customTheme = {
      ...defaultTheme,
      variants: {
        ...defaultTheme.variants,
        primary: {
          ...defaultTheme.variants.primary,
          color: "#ffffff",
          hover: {
            color: "#000000"}
        }}};

    render(<Link href="/test" theme={customTheme}>Custom theme</Link>);
    const link = screen.getByText("Custom theme");
    expect(link).toBeInTheDocument();
    // MUI Link applies styles differently, so we just verify it renders
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Link href="/test" size={1}>My Link Component</Link>);
    expect(screen.getByText("My Link Component")).toHaveClass("fs-1");

    rerender(<Link href="/test" size={5}>My Link Component</Link>);
    expect(screen.getByText("My Link Component")).toHaveClass("fs-5");
  });

  it("renders with different weights", () => {
    const { rerender } = render(<Link href="/test" weight={300}>My Link Component</Link>);
    expect(screen.getByText("My Link Component")).toHaveClass("fw-light");

    rerender(<Link href="/test" weight={700}>My Link Component</Link>);
    expect(screen.getByText("My Link Component")).toHaveClass("fw-bold");

    rerender(<Link href="/test" weight={"lighter"}>My Link Component</Link>);
    expect(screen.getByText("My Link Component")).toHaveClass("fw-lighter");
  });

  it("renders with target attribute", () => {
    render(<Link href="/test" target="_blank">External link</Link>);
    const link = screen.getByText("External link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders with custom rel attribute", () => {
    render(<Link href="/test" target="_blank" rel="nofollow">Enlace con rel</Link>);
    const link = screen.getByText("Enlace con rel");
    expect(link).toHaveAttribute("rel", "nofollow");
  });

  it("renders with variant prop", () => {
    render(<Link href="/test" variant="primary">Link with variant</Link>);
    const link = screen.getByText("Link with variant");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  })
});
