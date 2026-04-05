"use client";

import { ThemeModeProvider } from "@/presentation/@shared/contexts/theme-mode-context";
import { AuthProvider } from "@/presentation/@shared/contexts/auth-context";
import { LanguageProvider } from "@/presentation/@shared/contexts/language-context";
import { QueryProvider } from "@/presentation/@shared/providers/query-provider";
import { ToastProvider } from "@/presentation/@shared/providers/toast-provider";
import { ToastProvider as CustomToastProvider } from "@/presentation/@shared/components/ui/molecules/toast";
import { CartProvider } from "@/presentation/@shared/providers/cart-provider";
import { FavoritesProvider } from "@/presentation/@shared/providers/favorites-provider";
import { AppThemeProvider } from "@/presentation/@shared/components/ui/mui-theme-provider";
import { ModalProvider } from "@/presentation/@shared/contexts/modal-context";
import { WebSocketNotificationsProvider } from "@/presentation/@shared/providers/websocket-notifications-provider";
import { LibiaPageProvider } from "@/presentation/@shared/contexts/libia-page-context";

export function Providers({ children }: { readonly children: React.ReactNode }) {
  return (
    <>
      <QueryProvider>
        <LanguageProvider>
          <AuthProvider>
            <WebSocketNotificationsProvider>
              <LibiaPageProvider>
              <ThemeModeProvider>
                <AppThemeProvider>
                  <ModalProvider>
                    <ToastProvider>
                      <CustomToastProvider>
                      <CartProvider>
                        <FavoritesProvider>
                          {children}
                        </FavoritesProvider>
                      </CartProvider>
                      </CustomToastProvider>
                    </ToastProvider>
                  </ModalProvider>
                </AppThemeProvider>
              </ThemeModeProvider>
              </LibiaPageProvider>
            </WebSocketNotificationsProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryProvider>
    </>
  );
}
