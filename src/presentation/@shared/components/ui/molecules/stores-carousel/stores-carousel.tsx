"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { StoreCard } from "@/presentation/stores/components/store-card";
import { GridStore } from "@/presentation/stores/components/stores-grid/stores-grid";

export interface StoresCarouselProps {
  stores: GridStore[];
  title?: string;
  itemsPerSlide?: number;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

// Custom hooks
const useKeyboardNavigation = (callback: (direction: "prev" | "next") => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        callback("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        callback("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callback]);
};

const useAutoPlay = (callback: () => void, interval: number, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(callback, interval);
    return () => clearInterval(timer);
  }, [callback, interval, enabled]);
};

export const StoresCarousel: React.FC<StoresCarouselProps> = ({
  stores,
  title,
  itemsPerSlide = 2,
  className = "",
  autoPlay = true,
  autoPlayInterval = 6000,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Use 1 item per slide on mobile, otherwise use the provided itemsPerSlide
  const effectiveItemsPerSlide = isMobile ? 1 : itemsPerSlide;
  
  // State
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [animatingSlideIndex, setAnimatingSlideIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef(0);
  const previousActiveIndexRef = useRef(activeIndex);

  // Create slides
  const slides = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < stores.length; i += effectiveItemsPerSlide) {
      result.push(stores.slice(i, i + effectiveItemsPerSlide));
    }
    return result;
  }, [stores, effectiveItemsPerSlide]);
  
  // Reset activeIndex when itemsPerSlide changes (responsive breakpoint change)
  useEffect(() => {
    setActiveIndex(0);
  }, [effectiveItemsPerSlide]);

  // Calculate gaps for perfect alignment
  const calculateLayout = (slideLength: number) => {
    const totalGapPercent = slideLength > 1 ? Math.max(1, 6 / slideLength) * (slideLength - 1) : 0;
    const availableCardSpace = 100 - totalGapPercent;
    const cardWidthPercent = availableCardSpace / slideLength;
    const gapWidthPercent = totalGapPercent / (slideLength - 1) || 0;
    return { cardWidthPercent, gapWidthPercent };
  };

  // Navigation functions
  const goToSlide = useCallback((index: number) => {
    if (isAnimating || index === activeIndex) return;

    setIsAnimating(true);
    setActiveIndex(index);

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  }, [activeIndex, isAnimating]);

  const nextSlide = useCallback(() => {
    const nextIndex = (activeIndex + 1) % slides.length;
    goToSlide(nextIndex);
  }, [activeIndex, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    const prevIndex = (activeIndex - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  }, [activeIndex, slides.length, goToSlide]);

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
          prevSlide();
        } else {
          nextSlide();
        }
      }
    }
  }, [isDragging, isAnimating, prevSlide, nextSlide]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only prevent default if we're actually going to drag
    // Don't prevent on right click or middle click
    if (e.button !== 0) return;
    e.preventDefault(); // Prevent text selection on Mac
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

  // Trigger card animation when slide changes
  useEffect(() => {
    // Only animate if activeIndex actually changed (not just isDragging)
    const activeIndexChanged = previousActiveIndexRef.current !== activeIndex;
    
    if (activeIndexChanged && !isDragging) {
      // Immediately set cards to small state
      setAnimatingSlideIndex(activeIndex);
      // Small delay to start animation
      const timer = setTimeout(() => {
        // Animation will be triggered by shouldAnimate logic
        // Reset animation after it completes
        setTimeout(() => {
          setAnimatingSlideIndex(null);
        }, 600); // Match transition duration
      }, 10);
      
      // Update the previous index
      previousActiveIndexRef.current = activeIndex;
      
      return () => clearTimeout(timer);
    } else if (isDragging) {
      // If dragging, reset animation state
      setAnimatingSlideIndex(null);
    }
    // If index didn't change, don't do anything - this prevents re-animation
  }, [activeIndex, isDragging]);

  // Keyboard navigation
  useKeyboardNavigation((dir) => dir === "next" ? nextSlide() : prevSlide());

  // Auto-play
  useAutoPlay(nextSlide, autoPlayInterval, autoPlay);

  if (slides.length === 0) return null;

  const { cardWidthPercent, gapWidthPercent } = calculateLayout(effectiveItemsPerSlide);

  return (
    <Box className={`stores-carousel ${className}`} sx={{ position: "relative", width: "100%" }}>
      {/* Global keyframes for card animation */}
      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes cardScaleIn {
              0% {
                transform: scale(0.85);
                opacity: 0.7;
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
            .card-scale-in {
              animation: cardScaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
          `
        }}
      />
      {/* Title */}
      {title && (
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 700,
            mb: { xs: 3, md: 4 },
            color: "#ffffff",
            textAlign: { xs: "center", md: "left" }
          }}
        >
          {title}
        </Typography>
      )}

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
            transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            height: "100%",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none"
          }}
        >
          {slides.map((slideStores, slideIndex) => (
            <Box
              key={`slide-${slideIndex}`}
              sx={{
                flex: "0 0 100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
                gap: effectiveItemsPerSlide > 1 ? `${gapWidthPercent}%` : 0,
                padding: "32px 16px"
              }}
            >
              {slideStores.map((store, storeIndex) => {
                const isActiveSlide = slideIndex === activeIndex;
                const isAnimatingThisSlide = animatingSlideIndex === slideIndex && !isDragging;
                const shouldAnimate = isActiveSlide && isAnimatingThisSlide;
                // Cards should be small if: not active, or active but currently animating
                const isCardSmall = !isActiveSlide || (isActiveSlide && isAnimatingThisSlide);
                
                return (
                  <Box
                    key={store.id}
                    className={shouldAnimate ? "card-scale-in" : ""}
                    sx={{
                      flex: `0 0 ${cardWidthPercent}%`,
                      width: "100%",
                      maxWidth: `${cardWidthPercent}%`,
                      minWidth: 0,
                      position: "relative",
                      minHeight: 400,
                      display: "flex",
                      flexDirection: "column",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      MozUserSelect: "none",
                      msUserSelect: "none",
                      WebkitTouchCallout: "none",
                      pointerEvents: isDragging ? "none" : "auto",
                      // Initial state: smaller for non-active cards or cards being animated
                      transform: isCardSmall ? "scale(0.85)" : "scale(1)",
                      opacity: isCardSmall ? 0.7 : 1,
                      // Only use transition for non-active cards, not during or after animation
                      transition: (shouldAnimate || (isActiveSlide && !isAnimatingThisSlide)) 
                        ? "none" 
                        : "transform 0.3s ease, opacity 0.3s ease",
                      // Stagger animation for each card
                      animationDelay: shouldAnimate ? `${storeIndex * 0.1}s` : "0s"
                    }}
                  >
                    <Box sx={{ width: "100%", height: "100%" }}>
                      <StoreCard
                        id={store.id}
                        name={store.name}
                        description={store.description}
                        imageUrl={store.imageUrl}
                        profileImage={store.profileImage}
                        rating={store.rating}
                        plan={store.plan}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Pagination Dots */}
      {slides.length > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1.5,
            mt: 4,
            mb: 2
          }}
        >
          {slides.map((_, index) => (
            <Box
              key={index}
              onClick={() => goToSlide(index)}
              sx={{
                width: index === activeIndex ? 28 : 10,
                height: 10,
                borderRadius: "9999px",
                backgroundColor: index === activeIndex ? "rgba(41, 196, 128, 0.8)" : "rgba(100, 116, 139, 0.5)",
                border: index === activeIndex ? "2px solid rgba(41, 196, 128, 0.6)" : "none",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: index === activeIndex ? "rgba(41, 196, 128, 1)" : "rgba(148, 163, 184, 0.8)"
                }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default StoresCarousel;
