import React from "react";
import type { CategorySectionProps } from './types';
import { categorySectionTheme } from './theme';

const CategorySection: React.FC<CategorySectionProps> = ({ categories = [] }) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className={categorySectionTheme.container}>
      <h2 className={categorySectionTheme.title}>Categorías</h2>
      <div className={categorySectionTheme.grid}>
        {categories.map((category) => (
          <div key={category.id} className={categorySectionTheme.categoryCard}>
            <div className={categorySectionTheme.icon}>{category.icon}</div>
            <div className={categorySectionTheme.name}>{category.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
