"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { CompactTestimonialCard } from "../compact-testimonial-card/compact-testimonial-card";

type Slide = {
  id: number | string;
  image: string;
  title?: string;
  description?: string;
  rating?: number;
};

interface CompactTestimonialsCarouselProps {
  slides: Slide[];
}

export const CompactTestimonialsCarousel: React.FC<CompactTestimonialsCarouselProps> = ({ slides }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef(0);

  // Mostrar 1 testimonial en móvil, 3 en desktop
  const itemsPerSlide = isMobile ? 1 : 3;

  // Create slides
  const carouselSlides = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < slides.length; i += itemsPerSlide) {
      result.push(slides.slice(i, i + itemsPerSlide));
    }
    return result;
  }, [slides, itemsPerSlide]);

  // Calculate gaps for perfect alignment
  const calculateLayout = (slideLength: number) => {
    const totalGapPercent = slideLength > 1 ? Math.max(1, 6 / slideLength) * (slideLength - 1) : 0;
    const availableCardSpace = 100 - totalGapPercent;
    const cardWidthPercent = availableCardSpace / slideLength;
    const gapWidthPercent = totalGapPercent / (slideLength - 1) || 0;
    return { cardWidthPercent, gapWidthPercent };
  };

  // Reset activeIndex when screen size changes to prevent index out of bounds
  useEffect(() => {
    if (activeIndex >= carouselSlides.length && carouselSlides.length > 0) {
      setActiveIndex(0);
    }
  }, [carouselSlides.length, activeIndex]);

  // Reset activeIndex when itemsPerSlide changes (responsive breakpoint)
  useEffect(() => {
    setActiveIndex(0);
  }, [itemsPerSlide]);

  // Navigation functions
  const goToSlide = useCallback((index: number) => {
    if (isAnimating || index === activeIndex) return;
    if (index < 0 || index >= carouselSlides.length) return;

    setIsAnimating(true);
    setActiveIndex(index);

    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  }, [activeIndex, isAnimating, carouselSlides.length]);

  const goToNext = useCallback(() => {
    const nextIndex = (activeIndex + 1) % carouselSlides.length;
    goToSlide(nextIndex);
  }, [activeIndex, carouselSlides.length, goToSlide]);

  const goToPrev = useCallback(() => {
    const prevIndex = (activeIndex - 1 + carouselSlides.length) % carouselSlides.length;
    goToSlide(prevIndex);
  }, [activeIndex, carouselSlides.length, goToSlide]);

  // Drag handlers
  const handleDragStart = useCallback((clientX: number) => {
    if (isAnimating) return;
    setIsDragging(true);
    setDragStart(clientX);
    setDragOffset(0);
    dragOffsetRef.current = 0;
  }, [isAnimating]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging || isAnimating) return;
    const offset = clientX - dragStart;
    setDragOffset(offset);
    dragOffsetRef.current = offset;
  }, [isDragging, isAnimating, dragStart]);

  const handleDragEnd = useCallback(() => {
    // Always clean up state first, regardless of current state
    const wasDragging = isDragging;
    const currentOffset = dragOffsetRef.current;
    
    // Clean up immediately
    setIsDragging(false);
    setDragOffset(0);
    setDragStart(0);
    dragOffsetRef.current = 0;
    
    // Only process slide change if we were actually dragging and not animating
    if (wasDragging && !isAnimating) {
      const threshold = containerRef.current ? containerRef.current.offsetWidth * 0.2 : 100;
      
      // Check if we should change slide
      if (Math.abs(currentOffset) > threshold) {
        if (currentOffset > 0) {
          goToPrev();
        } else {
          goToNext();
        }
      }
    }
  }, [isDragging, isAnimating, goToPrev, goToNext]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only prevent default if we're actually going to drag
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    handleDragStart(e.clientX);
  }, [handleDragStart]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault(); // Prevent scrolling while dragging
    }
    handleDragMove(e.touches[0].clientX);
  }, [handleDragMove, isDragging]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Global mouse events for drag
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      e.preventDefault(); // Prevent text selection during drag
      e.stopPropagation();
      handleDragMove(e.clientX);
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      // Always end drag on mouse up, regardless of button
      handleDragEnd();
      e.preventDefault();
      e.stopPropagation();
    };

    const handleGlobalMouseLeave = () => {
      // Clean up if mouse leaves window
      handleDragEnd();
    };

    const handleSelectStart = (e: Event) => {
      // Prevent text selection on Mac during drag
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e: Event) => {
      // Prevent drag and drop of text/images during carousel drag
      e.preventDefault();
      return false;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalMouseUp, { capture: true });
    window.addEventListener('mouseleave', handleGlobalMouseLeave);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp, { capture: true });
      window.removeEventListener('mouseleave', handleGlobalMouseLeave);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      // Ensure cleanup on unmount
      setIsDragging(false);
      setDragOffset(0);
      setDragStart(0);
      dragOffsetRef.current = 0;
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Auto-play
  useEffect(() => {
    if (isDragging || isAnimating) return;
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [goToNext, isDragging, isAnimating]);

  // Pagination dots
  const renderDots = () => {
    if (carouselSlides.length <= 1) return null;
    
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          mt: 3,
          flexWrap: 'wrap'
        }}
      >
        {carouselSlides.map((_, index) => (
          <Box
            key={index}
            onClick={() => goToSlide(index)}
            sx={{
              width: activeIndex === index ? 24 : 6,
              height: 6,
              borderRadius: '9999px',
              backgroundColor: activeIndex === index ? '#29C480' : 'rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: activeIndex === index ? '#10B981' : 'rgba(255, 255, 255, 0.4)'
              }
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </Box>
    );
  };

  if (carouselSlides.length === 0) return null;

  const { cardWidthPercent, gapWidthPercent } = calculateLayout(itemsPerSlide);

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      {/* Smooth slide transition carousel */}
      <Box
        ref={containerRef}
        sx={{
          position: "relative",
          width: "100%",
          height: "auto",
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          WebkitTouchCallout: "none",
          "& *": {
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            WebkitTouchCallout: "none"
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => {
          if (isDragging) {
            handleDragEnd();
          }
        }}
        onContextMenu={(e) => {
          // Prevent context menu during drag
          if (isDragging) {
            e.preventDefault();
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            height: "100%",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none"
          }}
        >
          {carouselSlides.map((slide, slideIndex) => (
            <Box
              key={`slide-${slideIndex}`}
              sx={{
                flex: "0 0 100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
                gap: itemsPerSlide > 1 ? `${gapWidthPercent}%` : 0,
                padding: { xs: "16px 16px", md: "32px 16px" }
              }}
            >
              {slide.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    flex: `0 0 ${cardWidthPercent}%`,
                    width: "100%",
                    maxWidth: `${cardWidthPercent}%`,
                    minWidth: 0,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    WebkitTouchCallout: "none",
                    pointerEvents: isDragging ? "none" : "auto"
                  }}
                >
                  <CompactTestimonialCard
                    id={item.id}
                    image={item.image}
                    title={item.title}
                    description={item.description}
                    rating={item.rating}
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

export default CompactTestimonialsCarousel;
