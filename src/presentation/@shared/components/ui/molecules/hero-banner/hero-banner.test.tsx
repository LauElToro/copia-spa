import { render } from "@testing-library/react";
import HeroBanner from "./hero-banner";
import { ThemeModeProvider } from "@/presentation/@shared/contexts/theme-mode-context";

describe("HeroBanner", () => {
  it("renders without crashing", () => {
    render(
      <ThemeModeProvider>
        <HeroBanner
          title="Test Title"
          description="Test description"
          image="/test.jpg"
          ctaText="Click aquí"
          ctaLink="/test"
          width={600}
          height={400}
        />
      </ThemeModeProvider>
    );
  });
});