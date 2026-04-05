"use client";

import React, { useEffect, useState } from "react";
import { Box, Container } from "@mui/material";
import MainLayout from "@/presentation/@shared/components/layouts/main-layout";
import { ProductCarousel } from "@/presentation/@shared/components/ui/molecules/product-carousel";

import { useProducts } from "@/presentation/@shared/hooks/use-products";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { ProductEntity } from "@/presentation/@shared/types/product";
import { getPrimaryImage } from '@/presentation/@shared/utils/product-mapper';
import PartnersCTA from "@/presentation/@shared/components/ui/molecules/partners-cta";
import MobileAppCTA from "@/presentation/@shared/components/ui/molecules/mobile-app-cta";
import CTA from "@/presentation/@shared/components/ui/molecules/cta";
import DecentralizationSection from "@/presentation/@shared/components/ui/molecules/decentralization-section/decentralization-section";
import { LoadingSpinner } from "@/presentation/@shared/components/ui/atoms/loading-spinner";



const extractDiscount = (promotion?: string): number | undefined => {
  if (!promotion) {
    return undefined;
  }
  const match = promotion.match(/(\d{1,3})%/);
  if (!match) {
    return undefined;
  }
  const parsed = Number.parseInt(match[1], 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
    return undefined;
  }
  return parsed;
};

export default function HomePage() {
  const [itemsPerSlide, setItemsPerSlide] = useState(5);
  const { offers, useProductsByCategory, categories } = useProducts();
  const { t } = useLanguage();

  // Normalizar para evitar problemas con tildes / mayúsculas
  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // ID de categoría (nombre flexible) — solo raíz; sin parent_id
  const getCategoryId = (categoryName: string) => {
    const list = categories.data;
    if (!Array.isArray(list)) return undefined;
    const norm = normalize(categoryName);
    const root = list.filter(
      (cat) => !cat.parentId && !cat.parent_id
    );
    const exact = root.find((cat) => normalize(cat.name) === norm);
    if (exact) return exact.id;
    // Coincidencia parcial: "Electrónica" / "Electronica", "Vehículos" / "Vehiculos"
    const partial = root.find((cat) => {
      const n = normalize(cat.name);
      return n.includes(norm) || norm.includes(n);
    });
    return partial?.id;
  };

  const deportesId = getCategoryId("Deportes");
  const electronicaId = getCategoryId("Electronica");
  const vehiculosId = getCategoryId("Vehículos");

  // Solo cuando hay categorías en API (evita queries con id vacío)
  const categoriesLoaded =
    !categories.isLoading &&
    Array.isArray(categories.data) &&
    categories.data.length > 0;
  
  const deportesQuery = useProductsByCategory(categoriesLoaded && deportesId ? deportesId : "");
  const electronicaQuery = useProductsByCategory(categoriesLoaded && electronicaId ? electronicaId : "");
  const vehiculosQuery = useProductsByCategory(categoriesLoaded && vehiculosId ? vehiculosId : "");

  useEffect(() => {
    function handleResize() {
      const w = globalThis.window.innerWidth;
      if (w < 767) setItemsPerSlide(2);
      else if (w < 1024) setItemsPerSlide(3);
      else if (w < 1199) setItemsPerSlide(4);
      else setItemsPerSlide(5);
    }
    handleResize();
    globalThis.window.addEventListener("resize", handleResize);
    return () => globalThis.window.removeEventListener("resize", handleResize);
  }, []);

  const mapProductToCardProps = (product: ProductEntity) => {
    const discountPercent = extractDiscount(product.promotion);
    const finalPrice = discountPercent
      ? product.price * (1 - discountPercent / 100)
      : product.price;

    // Extraer promociones desde meta.promotions
    const meta = product.meta as { promotions?: {
      promoReturn?: string;
      promoShipping?: string;
      promoBanks?: string;
    } } | undefined;
    const promotions = meta?.promotions || {};

    return {
      id: product.id,
      image: getPrimaryImage(product),
      title: product.name,
      price: finalPrice,
      originalPrice: discountPercent ? product.price : undefined,
      discount: discountPercent,
      currency: product.crypto || "USD",
      pesosPrice: product.price_ars,
      // Promociones para vectores de venta
      hasSecurePurchase: promotions.promoReturn === "yes",
      hasFreeShipping: false, // Se puede agregar si viene de otro lugar
      hasInterestFreeInstallments: promotions.promoBanks === "yes",
      shippingTime: promotions.promoShipping === "24hs" || promotions.promoShipping === "48hs" 
        ? promotions.promoShipping 
        : undefined,
    };
  };

  const featuredProducts =
    offers.data?.slice(0, 10).map(mapProductToCardProps) ?? [];

  const sportsProducts =
    deportesQuery.data?.slice(0, 10).map(mapProductToCardProps) ?? [];

  const electronicsProducts =
    electronicaQuery.data?.slice(0, 10).map(mapProductToCardProps) ?? [];

  const vehiclesProducts =
    vehiculosQuery.data?.slice(0, 10).map(mapProductToCardProps) ?? [];

  // Mostrar loading solo para el contenido, no para toda la página
  const isLoading =
    categories.isLoading ||
    offers.isLoading ||
    deportesQuery.isLoading ||
    electronicaQuery.isLoading ||
    vehiculosQuery.isLoading;

  return (
    <MainLayout>
      {/* Loading spinner solo si está cargando */}
      {isLoading && (
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", py: 5 }}>
            <LoadingSpinner color="success" size="large" />
          </Box>
        </Container>
      )}

      {/* Productos destacados */}
      {!isLoading && (
        <Box
          component="section"
          sx={{
            py: 8,
            backgroundColor: '#000000',
            position: 'relative'
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
            <ProductCarousel
              products={featuredProducts}
              itemsPerSlide={itemsPerSlide}
              showArrows={false}
              isSectionVisible={true}
              title={t.home.featuredProducts}
            />
          </Container>
        </Box>
      )}

      {/* Mobile App CTA */}
      {!isLoading && (
        <Box component="section" sx={{ py: { xs: 5, md: 10 } }}>
          <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
            <MobileAppCTA />
          </Container>
        </Box>
      )}

      {/* Sports */}
      {!isLoading && (
        <Box
          component="section"
          sx={{
            py: 8,
            backgroundColor: '#080808',
            position: 'relative'
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
            <ProductCarousel
              products={sportsProducts}
              itemsPerSlide={itemsPerSlide}
              showArrows={false}
              isSectionVisible={true}
              title={t.home.sports}
            />
          </Container>
        </Box>
      )}

      {/* CTA - Vende sin comisiones */}
      {!isLoading && (
        <Box component="section" sx={{ py: { xs: 5, md: 10 } }}>
          <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
            <CTA />
          </Container>
        </Box>
      )}

      {/* Electronics */}
      {!isLoading && (
        <Box
          component="section"
          sx={{
            py: 8,
            backgroundColor: '#000000',
            position: 'relative'
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
            <ProductCarousel
              products={electronicsProducts}
              itemsPerSlide={itemsPerSlide}
              showArrows={false}
              isSectionVisible={true}
              title={t.home.electronics}
            />
          </Container>
        </Box>
      )}

      {/* Partners CTA */}
      {!isLoading && (
        <Box component="section" sx={{ py: { xs: 5, md: 10 } }}>
          <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
            <PartnersCTA />
          </Container>
        </Box>
      )}

      {/* Vehicles */}
      {!isLoading && (
        <Box
          component="section"
          sx={{
            py: 8,
            backgroundColor: '#000000',
            position: 'relative'
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
            <ProductCarousel
              products={vehiclesProducts}
              itemsPerSlide={itemsPerSlide}
              showArrows={false}
              isSectionVisible={true}
              title={t.home.vehicles}
            />
          </Container>
        </Box>
      )}

      {/* Decentralization Section */}
      {!isLoading && <DecentralizationSection />}
    </MainLayout>
  );
}
