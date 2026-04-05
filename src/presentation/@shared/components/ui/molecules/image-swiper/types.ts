export interface ImageSwiperBreakpoint {
  [width: number]: {
    slidesPerView: number;
    spaceBetween?: number;
  };
  [ratio: string]: {
    slidesPerView: number;
    spaceBetween?: number;
  };
}

export interface ImageSwiperProps {
  images: string[];
  slidesPerView?: number;
  spaceBetween?: number;
  loop?: boolean;
  showIndicators?: boolean;
  showNavigation?: boolean;
  autoplay?: boolean | { delay: number };
  breakpoints?: ImageSwiperBreakpoint;
  className?: string;
  imageClassName?: string;
  height?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  imageWidth?: number;
  imageHeight?: number;
}