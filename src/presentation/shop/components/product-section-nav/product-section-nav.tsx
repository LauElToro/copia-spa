"use client";

import React, { useCallback } from "react";
import { Box, Chip } from "@mui/material";

export interface ProductSectionNavItem {
  id: string;
  label: string;
}

interface ProductSectionNavProps {
  items: ProductSectionNavItem[];
}

/**
 * Navegación rápida por anclas dentro del detalle de producto (scroll suave).
 * Sticky bajo el header; en móvil scroll horizontal.
 */
export function ProductSectionNav({ items }: ProductSectionNavProps) {
  const scrollTo = useCallback((anchorId: string) => {
    const el = document.getElementById(anchorId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (!items.length) return null;

  return (
    <Box
      component="nav"
      aria-label="Secciones del producto"
      sx={{
        position: "sticky",
        top: { xs: 56, sm: 64 },
        zIndex: 1200,
        py: 1.5,
        mb: 2,
        mx: { xs: -1, sm: 0 },
        px: { xs: 1, sm: 0 },
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 100%)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(41, 196, 128, 0.15)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "nowrap",
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          pb: 0.5,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { height: 4 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(41, 196, 128, 0.35)",
            borderRadius: 2,
          },
        }}
      >
        {items.map((item) => (
          <Chip
            key={item.id}
            component="button"
            type="button"
            label={item.label}
            onClick={() => scrollTo(item.id)}
            sx={{
              flexShrink: 0,
              borderColor: "rgba(41, 196, 128, 0.35)",
              color: "#e2e8f0",
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              fontWeight: 600,
              fontSize: { xs: "0.8rem", sm: "0.85rem" },
              height: 34,
              "&:hover": {
                borderColor: "#29C480",
                backgroundColor: "rgba(41, 196, 128, 0.12)",
              },
            }}
            variant="outlined"
          />
        ))}
      </Box>
    </Box>
  );
}

export default ProductSectionNav;
