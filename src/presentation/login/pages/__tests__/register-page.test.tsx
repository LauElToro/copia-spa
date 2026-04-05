import React from "react";
import { render, waitFor } from "@testing-library/react";
import RegisterPage from "../register-page";
import { useAuth } from "@/presentation/@shared/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { LanguageProvider } from "@/presentation/@shared/contexts/language-context";
import { ToastProvider } from "@/presentation/@shared/components/ui/molecules/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/register'),
}));

jest.mock("@/presentation/@shared/hooks/use-auth");

jest.mock("@/presentation/@shared/components/ui/molecules/toast", () => ({
  useToast: () => ({
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/presentation/@shared/contexts/theme-mode-context", () => ({
  useThemeMode: () => ({
    mode: "dark",
    toggleMode: jest.fn(),
  }),
}));

// Mock useToast
const mockToastError = jest.fn();
jest.mock("@/presentation/@shared/components/ui/molecules/toast", () => ({
  useToast: () => ({
    error: mockToastError,
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("RegisterPage feedback", () => {
  const requireGuestMock = jest.fn();
  const pushMock = jest.fn();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  beforeEach(() => {
    mockToastError.mockClear();
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === "type" ? "commerce" : null),
    });
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    (useAuth as jest.Mock).mockReturnValue({
      registerIntegrated: {
        mutate: jest.fn(),
        isPending: false,
        isSuccess: false,
        isError: true,
        error: {
          response: {
            data: { message: "El código de embajador no es válido" },
          },
        },
      },
      requireGuest: requireGuestMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.skip("shows backend error message when ambassador code is invalid", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <ToastProvider>
            <RegisterPage />
          </ToastProvider>
        </LanguageProvider>
      </QueryClientProvider>
    );

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith(
        "El código de embajador no es válido",
        expect.any(Object)
      )
    );

    expect(requireGuestMock).toHaveBeenCalledWith("/admin/panel/home");
    expect(pushMock).not.toHaveBeenCalled();
  });
});
