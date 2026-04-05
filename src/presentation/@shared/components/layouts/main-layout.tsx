'use client';

import React, { ReactNode, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import Navbar from "../ui/organisms/navbar/navbar";
import Footer from "../ui/molecules/footer/footer";
import { useThemeMode } from "@/presentation/@shared/contexts/theme-mode-context";
import PageTitle from "../ui/molecules/page-title/page-title";
import CartSidebar from "../ui/molecules/cart-sidebar/cart-sidebar";
import BannerCarousel from "../ui/molecules/banner-carousel";

interface MainLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, pageTitle }) => {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const { mode } = useThemeMode();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const isHomePage = pathname === "/";

  // URLs de los banners (solo para home)
  // Assets en /public (Netlify/CDN); evita S3 bloqueado por referrer/403 en prototipo.
  const bannerImages = isHomePage
    ? [
        "/images/bannerhome/banner-1.svg",
        "/images/bannerhome/banner-2.svg",
        "/images/bannerhome/banner-3.svg",
      ]
    : [];

  return (
    <Box
      component="main"
      data-theme={mode}
      className="min-h-screen bg-black"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#fafafa"
      }}
    >
      {/* Header/Navbar */}
      <Navbar />

      {/* Banner Carousel - solo en home, siempre visible */}
      {isHomePage && <BannerCarousel banners={bannerImages} interval={3000} />}

      {/* Muestra barra de titulo si se especifica  */}
      {pageTitle && <PageTitle title={pageTitle} />}

      {/* Main content - sin Container para que los componentes controlen su propio ancho */}
      <Box
        component="div"
        sx={{
          flexGrow: 1
        }}
      >
          {children}
      </Box>

      {/* Footer - siempre al bottom */}
      <Footer />

      {/* Sidebar del carrito */}
      <CartSidebar />
    </Box>
  );
};

export default MainLayout;
