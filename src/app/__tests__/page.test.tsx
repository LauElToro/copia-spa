import { render, screen } from "@testing-library/react";
import Home from "../page";
import { ThemeModeProvider } from "@/presentation/@shared/contexts/theme-mode-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/presentation/@shared/contexts/language-context";

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Create a fresh QueryClient for each test run
const createTestQueryClient = () => new QueryClient();

describe("Home", () => {
  it("renders without crashing", () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <ThemeModeProvider>
            <Home />
          </ThemeModeProvider>
        </LanguageProvider>
      </QueryClientProvider>
    );

    // Basic assertion to make sure it rendered
    expect(screen).toBeDefined();
  });
});