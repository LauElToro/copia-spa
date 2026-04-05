"use client";

import React from "react";
import { Box } from "@mui/material";

export const StoreCardSkeleton: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '280px', md: '300px' },
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))',
        border: '2px solid rgba(41, 196, 128, 0.1)',
        borderRadius: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Banner Skeleton */}
      <Box
        sx={{ 
          position: 'relative', 
          width: '100%',
          paddingBottom: '32px',
        }}
      >
        <Box
          sx={{ 
            position: 'relative', 
            width: '100%', 
            paddingTop: '70%',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            overflow: 'hidden',
            borderRadius: "16px 16px 0 0",
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(71, 85, 105, 0.3)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </Box>

        {/* Profile Image Skeleton */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '3px solid rgba(41, 196, 128, 0.3)',
            backgroundColor: 'rgba(71, 85, 105, 0.3)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      </Box>

      {/* Content Skeleton */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          padding: 1.5,
          paddingTop: 3,
        }}
      >
        {/* Store Name Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
          <Box
            sx={{
              width: '60%',
              height: 24,
              borderRadius: '4px',
              backgroundColor: 'rgba(71, 85, 105, 0.3)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </Box>

        {/* Rating Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Box
            sx={{
              width: '30%',
              height: 16,
              borderRadius: '4px',
              backgroundColor: 'rgba(71, 85, 105, 0.3)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </Box>

        {/* Description Skeleton */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              width: '90%',
              height: 12,
              borderRadius: '4px',
              backgroundColor: 'rgba(71, 85, 105, 0.3)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <Box
            sx={{
              width: '70%',
              height: 12,
              borderRadius: '4px',
              backgroundColor: 'rgba(71, 85, 105, 0.3)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </Box>

        {/* Button Skeleton */}
        <Box sx={{ marginTop: 'auto', paddingTop: 1.5 }}>
          <Box
            sx={{
              width: '100%',
              height: 40,
              borderRadius: '8px',
              backgroundColor: 'rgba(71, 85, 105, 0.3)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default StoreCardSkeleton;

