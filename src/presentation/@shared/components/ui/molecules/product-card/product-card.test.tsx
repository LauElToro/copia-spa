import { render, screen } from "@testing-library/react";
import { ProductCard } from "./product-card";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeModeProvider } from "@/presentation/@shared/contexts/theme-mode-context";
import { LanguageProvider } from "@/presentation/@shared/contexts/language-context";
import { ToastProvider } from "@/presentation/@shared/components/ui/molecules/toast";
import { ModalProvider } from "@/presentation/@shared/contexts/modal-context";

// Create a test-safe QueryClient
const createTestQueryClient = () => new QueryClient();

describe("ProductCard", () => {
  it("renders without crashing", () => {
    const queryClient = createTestQueryClient();

    render(
      <LanguageProvider>
        <ThemeModeProvider initialMode="dark">
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <ModalProvider>
                <ProductCard
                  id="1"
                  image="https://example.com/fallback.jpg"
                  title="Sample Product"
                  price={100}
                />
              </ModalProvider>
            </ToastProvider>
          </QueryClientProvider>
        </ThemeModeProvider>
      </LanguageProvider>
    );

    // ProductCard uses Text component which requires ThemeModeProvider
    // Since we're already providing it, the text should render
    expect(screen.getByText("Sample Product")).toBeInTheDocument();
  });
});