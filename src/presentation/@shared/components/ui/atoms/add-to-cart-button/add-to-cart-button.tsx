'use client';

import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { Button } from '../button';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

export interface AddToCartButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  onClick,
  isLoading = false,
  className = '',
  size = 'lg',
  disabled = false
}) => {
  const { t } = useLanguage();
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  return (
    <Button
      variant="secondary"
      size={size}
      onClick={onClick}
      disabled={disabled}
      isLoading={isLoading}
      fullWidth
      className={className}
      icon={<FaShoppingCart size={iconSizes[size]} />}
    >
      {t.shop.addToCart}
    </Button>
  );
};

export default AddToCartButton;
