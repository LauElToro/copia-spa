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
  const bannerImages = isHomePage
    ? [
        "https://prod-libertyclub.s3.us-east-2.amazonaws.com/banners/Banner%202.png",
        "https://prod-libertyclub.s3.us-east-2.amazonaws.com/banners/Banner%203.png",
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
