"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { ProductCardProps } from "../product-card/product-card";
import { AnimatedProductCard } from "../../atoms/animated-product-card";

export interface ProductCarouselProps {
  products: ProductCardProps[];
  title?: string;
  itemsPerSlide?: number;
  className?: string;
  showArrows?: boolean;
  sectionDelay?: number;
  isSectionVisible?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  slicedTitle?: boolean;
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

const useAutoPlay = (callback: () => void, interval: number, enabled: boolean, paused: boolean = false) => {
  useEffect(() => {
    if (!enabled || paused) return;

    const timer = setInterval(callback, interval);
    return () => clearInterval(timer);
  }, [callback, interval, enabled, paused]);
};

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  title,
  itemsPerSlide = 5,
  className = "",
  showArrows = true,
  sectionDelay = 0,
  isSectionVisible = true,
  autoPlay = true,
  autoPlayInterval = 4000,
  slicedTitle = false
}) => {
  // State
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Solo para UI (cursor, autoplay)
  const [animatingSlideIndex, setAnimatingSlideIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef(0);
  const dragStartPositionRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isAnimatingRef = useRef(false); // Para rastrear el estado de animación
  const previousActiveIndexRef = useRef(activeIndex);

  const [responsiveItems, setResponsiveItems] = useState(itemsPerSlide);

  useEffect(() => {
    const updateItems = () => {
      const width = window.innerWidth;

      if (width <= 480) setResponsiveItems(1);
      else if (width <= 768) setResponsiveItems(2);
      else if (width <= 1024) setResponsiveItems(3);
      else setResponsiveItems(itemsPerSlide);
    };

    updateItems();

    window.addEventListener("resize", updateItems);
    return () => window.removeEventListener("resize", updateItems);
  }, [itemsPerSlide]);

  // Create slides
  const slides = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < products.length; i += responsiveItems) {
      result.push(products.slice(i, i + responsiveItems));
    }
    return result;
  }, [products, responsiveItems]);

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


  // Mouse events - solo guardar posición inicial, el drag se inicia en mousemove
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Solo botón izquierdo
    if (e.button !== 0) return;
    if (isAnimatingRef.current) return;

    const target = e.target as HTMLElement;

    // No iniciar drag si es un icono de acción
    const isActionIcon = target.closest('[data-action-icon]') !== null;
    if (isActionIcon) return;

    // Guardar posición inicial y tiempo para detectar si es drag o click
    dragStartPositionRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
  }, []);

  // Ref para el elemento que se transforma durante el drag
  const slidesContainerRef = useRef<HTMLDivElement>(null);
  // Ref para tracking del drag táctil
  const touchDragRef = useRef<{
    startX: number;
    startY: number;
    currentX: number;
    isHorizontal: boolean | null; // null = no determinado, true = horizontal, false = vertical
  } | null>(null);
  // Flag para indicar si el cambio de slide fue por touch (para skip animation)
  const skipAnimationRef = useRef(false);

  // Touch events - usando manipulación DOM directa para evitar problemas de estado
  useEffect(() => {
    const container = containerRef.current;
    const slidesContainer = slidesContainerRef.current;
    if (!container || !slidesContainer) return;

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-action-icon]')) return;
      if (isAnimatingRef.current) return;

      touchDragRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        currentX: e.touches[0].clientX,
        isHorizontal: null
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchDragRef.current) return;
      if (isAnimatingRef.current) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - touchDragRef.current.startX;
      const deltaY = currentY - touchDragRef.current.startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determinar dirección si aún no está determinada
      if (touchDragRef.current.isHorizontal === null) {
        if (absDeltaX < 5 && absDeltaY < 5) return; // Umbral bajo para respuesta rápida

        // Si es más vertical, liberar y permitir scroll nativo
        if (absDeltaY > absDeltaX) {
          touchDragRef.current = null;
          return;
        }

        // Es horizontal - capturar
        touchDragRef.current.isHorizontal = true;
        setIsDragging(true);
      }

      // Si es drag horizontal, actualizar posición directamente en el DOM
      if (touchDragRef.current.isHorizontal) {
        e.preventDefault(); // Prevenir scroll solo cuando es horizontal
        touchDragRef.current.currentX = currentX;

        // Manipulación DOM directa - sin React state
        const offset = deltaX;
        slidesContainer.style.transition = 'none';
        slidesContainer.style.transform = `translateX(calc(-${activeIndex * 100}% + ${offset}px))`;
      }
    };

    const onTouchEnd = () => {
      if (!touchDragRef.current || !touchDragRef.current.isHorizontal) {
        touchDragRef.current = null;
        return;
      }

      const deltaX = touchDragRef.current.currentX - touchDragRef.current.startX;
      const threshold = container.offsetWidth * 0.15; // 15% del ancho
      const shouldChangeSlide = Math.abs(deltaX) > threshold;

      // Animación rápida que continúa el momentum del swipe
      const duration = 280; // ms - rápido para sentirse conectado al swipe
      const easing = 'cubic-bezier(0.25, 0.1, 0.25, 1)'; // ease-out suave

      if (shouldChangeSlide) {
        // Animar hacia el siguiente/anterior slide
        const targetIndex = deltaX > 0
          ? (activeIndex - 1 + slides.length) % slides.length
          : (activeIndex + 1) % slides.length;

        slidesContainer.style.transition = `transform ${duration}ms ${easing}`;
        slidesContainer.style.transform = `translateX(-${targetIndex * 100}%)`;

        // Después de la animación, limpiar y actualizar React state
        setTimeout(() => {
          slidesContainer.style.transition = '';
          slidesContainer.style.transform = '';
          // Marcar para skip animation (fue swipe táctil)
          skipAnimationRef.current = true;
          if (deltaX > 0) {
            prevSlide();
          } else {
            nextSlide();
          }
        }, duration);
      } else {
        // Snap back suave a la posición original
        slidesContainer.style.transition = `transform ${duration}ms ${easing}`;
        slidesContainer.style.transform = `translateX(-${activeIndex * 100}%)`;

        // Limpiar después de la animación
        setTimeout(() => {
          slidesContainer.style.transition = '';
          slidesContainer.style.transform = '';
        }, duration);
      }

      touchDragRef.current = null;
      setIsDragging(false);
    };

    const onTouchCancel = () => {
      // Limpiar estilos inline en caso de cancelación
      slidesContainer.style.transition = '';
      slidesContainer.style.transform = '';
      touchDragRef.current = null;
      setIsDragging(false);
    };

    // Agregar listeners con passive: false para poder prevenir scroll
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchCancel);
      // Limpiar estilos al desmontar
      slidesContainer.style.transition = '';
      slidesContainer.style.transform = '';
    };
  }, [activeIndex, prevSlide, nextSlide, slides.length]);

  // Sincronizar isAnimatingRef con el estado isAnimating
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  // Ref para tracking del drag con mouse
  const mouseDragRef = useRef<{
    startX: number;
    isDragging: boolean;
  } | null>(null);

  // Global mouse events for drag - usando manipulación DOM directa (igual que touch)
  useEffect(() => {
    const container = containerRef.current;
    const slidesContainer = slidesContainerRef.current;
    if (!container || !slidesContainer) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      // Si hay una posición inicial guardada pero aún no estamos arrastrando
      if (dragStartPositionRef.current && !mouseDragRef.current?.isDragging && !isAnimatingRef.current) {
        const deltaX = Math.abs(e.clientX - dragStartPositionRef.current.x);
        const deltaY = Math.abs(e.clientY - dragStartPositionRef.current.y);

        // Solo iniciar drag si hay movimiento horizontal significativo
        if (deltaX > 5 && deltaX > deltaY) {
          mouseDragRef.current = {
            startX: dragStartPositionRef.current.x,
            isDragging: true
          };
          setIsDragging(true);
        } else if (deltaY > 10) {
          // Movimiento vertical - cancelar
          dragStartPositionRef.current = null;
          return;
        }
      }

      // Si estamos arrastrando, actualizar posición directamente en DOM
      if (mouseDragRef.current?.isDragging) {
        e.preventDefault();
        e.stopPropagation();

        const offset = e.clientX - mouseDragRef.current.startX;
        slidesContainer.style.transition = 'none';
        slidesContainer.style.transform = `translateX(calc(-${activeIndex * 100}% + ${offset}px))`;
        dragOffsetRef.current = offset;
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      // Si no estamos arrastrando, verificar si fue un click
      if (!mouseDragRef.current?.isDragging) {
        dragStartPositionRef.current = null;
        mouseDragRef.current = null;
        return;
      }

      const offset = dragOffsetRef.current;
      const threshold = container.offsetWidth * 0.15;
      const shouldChangeSlide = Math.abs(offset) > threshold;

      // Animación rápida que continúa el momentum del drag
      const duration = 280;
      const easing = 'cubic-bezier(0.25, 0.1, 0.25, 1)';

      if (shouldChangeSlide) {
        const targetIndex = offset > 0
          ? (activeIndex - 1 + slides.length) % slides.length
          : (activeIndex + 1) % slides.length;

        slidesContainer.style.transition = `transform ${duration}ms ${easing}`;
        slidesContainer.style.transform = `translateX(-${targetIndex * 100}%)`;

        setTimeout(() => {
          slidesContainer.style.transition = '';
          slidesContainer.style.transform = '';
          skipAnimationRef.current = true;
          if (offset > 0) {
            prevSlide();
          } else {
            nextSlide();
          }
        }, duration);
      } else {
        // Snap back
        slidesContainer.style.transition = `transform ${duration}ms ${easing}`;
        slidesContainer.style.transform = `translateX(-${activeIndex * 100}%)`;

        setTimeout(() => {
          slidesContainer.style.transition = '';
          slidesContainer.style.transform = '';
        }, duration);
      }

      // Prevenir click si hubo drag significativo
      if (Math.abs(offset) > 10) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Cleanup
      dragStartPositionRef.current = null;
      mouseDragRef.current = null;
      dragOffsetRef.current = 0;
      setIsDragging(false);
    };

    const handleGlobalMouseLeave = () => {
      if (mouseDragRef.current?.isDragging) {
        // Snap back on mouse leave
        slidesContainer.style.transition = 'transform 280ms cubic-bezier(0.25, 0.1, 0.25, 1)';
        slidesContainer.style.transform = `translateX(-${activeIndex * 100}%)`;
        setTimeout(() => {
          slidesContainer.style.transition = '';
          slidesContainer.style.transform = '';
        }, 280);
      }
      dragStartPositionRef.current = null;
      mouseDragRef.current = null;
      dragOffsetRef.current = 0;
      setIsDragging(false);
    };

    const handleSelectStart = (e: Event) => {
      if (mouseDragRef.current?.isDragging) {
        e.preventDefault();
        return false;
      }
    };

    const handleDragStartEvent = (e: Event) => {
      if (mouseDragRef.current?.isDragging) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalMouseUp, { capture: true });
    window.addEventListener('mouseleave', handleGlobalMouseLeave);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStartEvent);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp, { capture: true });
      window.removeEventListener('mouseleave', handleGlobalMouseLeave);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStartEvent);
      slidesContainer.style.transition = '';
      slidesContainer.style.transform = '';
    };
  }, [activeIndex, prevSlide, nextSlide, slides.length]);

  // Trigger card animation when slide changes (skip if from touch swipe)
  useEffect(() => {
    const activeIndexChanged = previousActiveIndexRef.current !== activeIndex;

    if (activeIndexChanged && !isDragging) {
      // Skip animation if triggered by touch swipe
      if (skipAnimationRef.current) {
        skipAnimationRef.current = false;
        previousActiveIndexRef.current = activeIndex;
        return;
      }

      setAnimatingSlideIndex(activeIndex);
      const timer = setTimeout(() => {
        setTimeout(() => {
          setAnimatingSlideIndex(null);
        }, 600);
      }, 10);

      previousActiveIndexRef.current = activeIndex;

      return () => clearTimeout(timer);
    } else if (isDragging) {
      setAnimatingSlideIndex(null);
    }
  }, [activeIndex, isDragging]);

  // Keyboard navigation
  useKeyboardNavigation((dir) => dir === "next" ? nextSlide() : prevSlide());

  // Auto-play (pausado durante drag)
  useAutoPlay(nextSlide, autoPlayInterval, autoPlay, isDragging);

  if (slides.length === 0) return null;

  const { cardWidthPercent, gapWidthPercent } = calculateLayout(responsiveItems);

  return (
    <Box className={`product-carousel ${className}`} sx={{ position: "relative", width: "100%" }}>
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
          variant="h2"
          className="text-4xl md:text-5xl font-bold text-white"
          sx={{
            fontWeight: "bold",
            mb: { xs: 3, md: 4 },
            color: "#ffffff",
            fontSize: { xs: "1.5rem", md: "3rem" },
            textAlign: "center"
          }}
        >
          {slicedTitle ? (
            <Box component="span" className="hero-subtitle-sliced">
              <span className="subtitle-top">{title}</span>
              <span className="subtitle-bottom" aria-hidden="true">{title}</span>
            </Box>
          ) : (
            title
          )}
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
          WebkitTouchCallout: "none"
        }}
        onMouseDown={handleMouseDown}
      >
        <Box
          ref={slidesContainerRef}
          sx={{
            width: "100%",
            display: "flex",
            transform: `translateX(-${activeIndex * 100}%)`,
            transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            height: "100%",
            touchAction: "pan-y" // Permitir scroll vertical, capturar horizontal
          }}
        >
          {slides.map((slideProducts, slideIndex) => (
            <Box
              key={`slide-${slideIndex}`}
              sx={{
                flex: "0 0 100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
                gap: responsiveItems > 1 ? `${gapWidthPercent}%` : 0,
                padding: "32px 16px"
              }}
            >
              {slideProducts.map((product, productIndex) => {
                const isActiveSlide = slideIndex === activeIndex;
                const isAnimatingThisSlide = animatingSlideIndex === slideIndex && !isDragging;
                const shouldAnimate = isActiveSlide && isAnimatingThisSlide;
                const isCardSmall = !isActiveSlide || (isActiveSlide && isAnimatingThisSlide);

                return (
                  <Box
                    key={product.id}
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
                      pointerEvents: isDragging ? "none" : "auto",
                      transform: isCardSmall ? "scale(0.85)" : "scale(1)",
                      opacity: isCardSmall ? 0.7 : 1,
                      // Siempre usar transición suave, excepto durante la animación keyframe
                      transition: shouldAnimate
                        ? "none"
                        : "transform 0.28s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.28s cubic-bezier(0.25, 0.1, 0.25, 1)",
                      animationDelay: shouldAnimate ? `${productIndex * 0.1}s` : "0s"
                    }}
                  >
                    <AnimatedProductCard
                      {...product}
                      className=""
                      index={productIndex}
                      sectionDelay={sectionDelay}
                      isSectionVisible={isSectionVisible}
                    />
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <Box
            onClick={prevSlide}
            sx={{
              position: "absolute",
              left: { xs: -16, md: 8 },
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(8px)",
              borderRadius: "50%",
              border: "2px solid rgba(41, 196, 128, 0.3)",
              color: "#cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              zIndex: 15,
              "&:hover": {
                backgroundColor: "rgba(41, 196, 128, 0.2)",
                color: "#29C480",
                borderColor: "rgba(41, 196, 128, 0.6)",
                transform: "translateY(-50%) scale(1.1)"
              }
            }}
          >
            <ChevronLeft fontSize="large" />
          </Box>
          <Box
            onClick={nextSlide}
            sx={{
              position: "absolute",
              right: { xs: -16, md: 8 },
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(8px)",
              borderRadius: "50%",
              border: "2px solid rgba(41, 196, 128, 0.3)",
              color: "#cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              zIndex: 15,
              "&:hover": {
                backgroundColor: "rgba(41, 196, 128, 0.2)",
                color: "#29C480",
                borderColor: "rgba(41, 196, 128, 0.6)",
                transform: "translateY(-50%) scale(1.1)"
              }
            }}
          >
            <ChevronRight fontSize="large" />
          </Box>
        </>
      )}

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

export default ProductCarousel;
