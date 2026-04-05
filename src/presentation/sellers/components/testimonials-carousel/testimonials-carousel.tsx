"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box } from "@mui/material";
import { TestimonialCard } from "../testimonial-card";

type Slide = {
  id: number | string;
  image: string;
  title?: string;
  description?: string;
};

interface TestimonialsCarouselProps {
  slides: Slide[];
}

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({ slides }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef(0);

  const itemsPerSlide = 2;

  // Create slides
  const carouselSlides = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < slides.length; i += itemsPerSlide) {
      result.push(slides.slice(i, i + itemsPerSlide));
    }
    return result;
  }, [slides]);

  // Calculate layout
  const calculateLayout = (slideLength: number) => {
    const totalGapPercent = slideLength > 1 ? Math.max(1, 6 / slideLength) * (slideLength - 1) : 0;
    const availableCardSpace = 100 - totalGapPercent;
    const cardWidthPercent = availableCardSpace / slideLength;
    const gapWidthPercent = totalGapPercent / (slideLength - 1) || 0;
    return { cardWidthPercent, gapWidthPercent };
  };

  // Navigation
  const goToSlide = useCallback((index: number) => {
    if (isAnimating || index === activeIndex) return;
    if (index < 0 || index >= carouselSlides.length) return;

    setIsAnimating(true);
    setActiveIndex(index);

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  }, [activeIndex, isAnimating, carouselSlides.length]);

  const goToNext = useCallback(() => {
    goToSlide((activeIndex + 1) % carouselSlides.length);
  }, [activeIndex, carouselSlides.length, goToSlide]);

  const goToPrev = useCallback(() => {
    goToSlide((activeIndex - 1 + carouselSlides.length) % carouselSlides.length);
  }, [activeIndex, carouselSlides.length, goToSlide]);

  // Auto-play
  useEffect(() => {
    if (isDragging || isAnimating) return;
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [goToNext, isDragging, isAnimating]);

  // Drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStart(clientX);
    setDragOffset(0);
    dragOffsetRef.current = 0;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - dragStart;
    dragOffsetRef.current = offset;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    const threshold = 50;
    if (Math.abs(dragOffsetRef.current) > threshold) {
      if (dragOffsetRef.current > 0) {
        goToPrev();
      } else {
        goToNext();
      }
    }
    setIsDragging(false);
    setDragOffset(0);
    dragOffsetRef.current = 0;
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Pagination dots
  const renderDots = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1.5,
          mt: 4,
          flexWrap: 'wrap'
        }}
      >
        {carouselSlides.map((_, index) => (
          <Box
            key={index}
            onClick={() => goToSlide(index)}
            sx={{
              width: activeIndex === index ? 32 : 8,
              height: 8,
              borderRadius: '9999px',
              backgroundColor: activeIndex === index ? '#29C480' : 'rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: activeIndex === index ? '#10B981' : 'rgba(255, 255, 255, 0.5)'
              }
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </Box>
    );
  };

  if (carouselSlides.length === 0) return null;

  const currentSlide = carouselSlides[activeIndex];
  const layout = calculateLayout(currentSlide.length);

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
            width: `${carouselSlides.length * 100}%`
          }}
        >
          {carouselSlides.map((slide, slideIndex) => (
            <Box
              key={slideIndex}
              sx={{
                width: `${100 / carouselSlides.length}%`,
                flexShrink: 0,
                display: 'flex',
                gap: `${layout.gapWidthPercent}%`,
                padding: 0
              }}
            >
              {slide.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    width: `${layout.cardWidthPercent}%`,
                    flex: 1,
                    minWidth: 0
                  }}
                >
                  <TestimonialCard
                    id={item.id}
                    image={item.image}
                    title={item.title}
                    description={item.description}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
      {renderDots()}
    </Box>
  );
};

export default TestimonialsCarousel;
