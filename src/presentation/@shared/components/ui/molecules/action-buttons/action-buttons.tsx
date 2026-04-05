import React from 'react';
import { Box, IconButton, Badge } from '@mui/material';
import { Favorite, ShoppingCart } from '@mui/icons-material';

interface ActionButtonsProps {
  favoritesCount?: number;
  cartCount?: number;
  onFavoritesClick?: () => void;
  onCartClick?: () => void;
  className?: string;
}

export function ActionButtons({
  favoritesCount = 0,
  cartCount = 0,
  onFavoritesClick,
  onCartClick,
  className,
}: ActionButtonsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
      {/* Favorites Button */}
      <IconButton
        onClick={onFavoritesClick}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
          },
          transition: 'color 300ms ease',
        }}
        className={className}
        aria-label="Favorites"
      >
        <Badge
          badgeContent={favoritesCount || undefined}
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              minWidth: 18,
              height: 18,
              borderRadius: '50%',
              fontSize: '0.75rem',
            },
          }}
        >
          <Favorite sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>

      {/* Shopping Cart Button */}
      <IconButton
        onClick={onCartClick}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
          },
          transition: 'color 300ms ease',
        }}
        className={className}
        aria-label="Shopping Cart"
      >
        <Badge
          badgeContent={cartCount || undefined}
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              minWidth: 18,
              height: 18,
              borderRadius: '50%',
              fontSize: '0.75rem',
            },
          }}
        >
          <ShoppingCart sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>
    </Box>
  );
}

export default ActionButtons;
