"use client";

import React from "react";
import { Box } from "@mui/material";
import { EmptyState } from "@/presentation/@shared/components/ui/atoms/empty-state";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { StoreCard } from "../store-card";

export interface GridStore {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  profileImage?: string;
  rating?: number;
  location?: string;
  phone?: string;
  plan?: string;
  kybVerified?: boolean;
  kycVerified?: boolean;
}

export interface StoresGridProps {
  sellers: GridStore[];
}

export const StoresGrid: React.FC<StoresGridProps> = ({ sellers }) => {
  const { t } = useLanguage();

  if (sellers.length === 0) {
    return (
      <EmptyState
        title={t.stores.noStoresFound}
        message={t.stores.emptyStateMessage}
      />
    );
  }

  return (
                <Box
                  sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 3,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {sellers.map((seller) => (
        <StoreCard
          key={seller.id}
          id={seller.id}
          name={seller.name}
          description={seller.description}
          imageUrl={seller.imageUrl}
          profileImage={seller.profileImage}
          rating={seller.rating}
          plan={seller.plan}
        />
      ))}
    </Box>
  );
};