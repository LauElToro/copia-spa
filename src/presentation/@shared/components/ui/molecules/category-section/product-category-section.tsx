import React from "react";
import type { ProductEntity } from "@/presentation/@shared/types/product";
import { ProductCard } from "../product-card";
import { getPrimaryImage } from "@/presentation/@shared/utils/product-mapper";

interface ProductCategorySectionProps {
  title: string;
  products: ProductEntity[];
}

export const ProductCategorySection: React.FC<ProductCategorySectionProps> = ({ title, products }) => {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            image={getPrimaryImage(product)}
            title={product.name}
            price={product.price}
            originalPrice={product.price}
            discount={0}
          />
        ))}
      </div>
    </section>
  );
};