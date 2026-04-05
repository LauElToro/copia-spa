import React from 'react';
import { SellerListProps } from './types';
import { sellerListTheme } from './theme';
import { SellerCard } from '../seller-card';

export const SellerList = ({
  sellers,
  categories,
  selectedCategory,
  onCategorySelect}: SellerListProps) => {
  const filteredSellers = selectedCategory
    ? sellers.filter((seller) => seller.category === selectedCategory)
    : sellers;

  return (
    <section className={sellerListTheme.container}>
      <h2 className={sellerListTheme.title}>Todos los Vendedores</h2>
      <div className={sellerListTheme.filters}>
        <button
          className={`${sellerListTheme.filterButton} ${
            selectedCategory === null ? sellerListTheme.filterButtonActive : ''
          }`}
          onClick={() => onCategorySelect(null)}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`${sellerListTheme.filterButton} ${
              selectedCategory === category ? sellerListTheme.filterButtonActive : ''
            }`}
            onClick={() => onCategorySelect(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className={sellerListTheme.grid}>
        {filteredSellers.map((seller) => (
          <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>
    </section>
  );
}; 