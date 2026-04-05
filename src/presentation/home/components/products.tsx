// products.tsx

import React from "react";
import { ProductCard, ProductCardProps } from "@/presentation/@shared/components/ui/molecules/product-card/product-card";


interface ProductsProps {
  products: ProductCardProps[];
}

const Products: React.FC<ProductsProps> = ({ products }) => {
  return (
    <>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          image={product.image}
          title={product.title}
          price={product.price}
          originalPrice={product.originalPrice}
          discount={product.discount}
          currency="USDT"
        />
      ))}
    </>
  );
};

export default Products;
