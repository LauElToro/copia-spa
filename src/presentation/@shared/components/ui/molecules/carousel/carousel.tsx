import React, { useState, useEffect, useCallback, useRef } from "react";
import Products from "@/presentation/home/components/products";
import { ProductCardProps } from "@/presentation/@shared/components/ui/molecules/product-card/product-card";

export interface CarouselProps {
  products: ProductCardProps[];
  autoPlayInterval?: number;
  showIndicators?: boolean;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  products,
  autoPlayInterval = 4000,
  showIndicators = true,
  className = ""}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (autoPlayInterval > 0) {
      const timer = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(timer);
    }
  }, [autoPlayInterval, nextSlide]);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transition = "transform 0.5s ease-in-out";
      carouselRef.current.style.transform = `translateX(-${(100 / products.length) * currentIndex}%)`;
    }
  }, [currentIndex, products.length]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Main carousel container */}
      <div className="relative w-full h-full">
        <div ref={carouselRef}  className="d-flex gap-3 flex-row w-full h-full" style={{ display: "flex", transition: "transform 0.5s ease-in-out"}}>
          <Products products={products} /> 
        </div>
      </div>


<div className="d-flex justify-content-center">
      {/* Indicadores */}
      {showIndicators && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {products.map((product, index) => (
            <button
              key={`carousel-indicator-${product.id || index}`}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? "bg-white" : "bg-white bg-opacity-50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default Carousel;
