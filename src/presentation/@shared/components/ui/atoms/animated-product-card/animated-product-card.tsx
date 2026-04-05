import React from 'react';
import { ProductCard, ProductCardProps } from '../../molecules/product-card/product-card';

interface AnimatedProductCardProps extends ProductCardProps {
  index: number;
  sectionDelay: number;
  isSectionVisible: boolean;
}

export const AnimatedProductCard: React.FC<AnimatedProductCardProps> = ({
  index,
  sectionDelay,
  isSectionVisible,
  ...productProps
}) => {
  // Delay base del bloque (1000ms) + delay de la card individual
  const cardDelay = sectionDelay + 500 + (index * 150); // 200ms entre cada card

  return (
    <div
      className="animated-product-card"
      style={{
        height: '100%',
        opacity: isSectionVisible ? 1 : 0,
        transform: isSectionVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${cardDelay}ms`}}
    >
      <ProductCard {...productProps} />
    </div>
  );
};