import React from 'react';
import { SellerRecommendationsProps } from './types';
import { sellerRecommendationsTheme } from './theme';
import { SellerCard } from '../seller-card';

export const SellerRecommendations = ({ sellers }: SellerRecommendationsProps) => {
  return (
    <section className={sellerRecommendationsTheme.container}>
      <h2 className={sellerRecommendationsTheme.title}>Vendedores Recomendados</h2>
      <div className={sellerRecommendationsTheme.grid}>
        {sellers.map((seller) => (
          <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>
    </section>
  );
}; 