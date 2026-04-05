import React from "react";
import { render, screen } from "@testing-library/react";
import Image from "./image";

describe("Image Component", () => {

  it("renders with required props", () => {
    render(<Image src= "https://example.com/test-image.jpg" alt= "Test Image" width={100} height={100}/>);
    const image = screen.getByAltText("Test Image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src");
    expect(image.getAttribute("src")).toContain("test-image.jpg");
  });

  it("renders with optional props", () => {
    render(
      <Image
        src= "https://example.com/test-image.jpg"
        alt= "Test Image"
        width={200}
        height={300}
        className="custom-class"
        loading="eager"
        objectFit="contain"
      />,
    );
    const image = screen.getByAltText("Test Image");
    expect(image).toHaveAttribute("width", "200");
    expect(image).toHaveAttribute("height", "300");
    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveClass("custom-class");
    expect(image).toHaveClass("object-contain");
  });

  it("handles click event", () => {
    const handleClick = jest.fn();
    render(<Image src= "https://example.com/test-image.jpg" alt= "Test Image" onClick={handleClick} width={100} height={100} />);
    const image = screen.getByAltText("Test Image");
    image.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
