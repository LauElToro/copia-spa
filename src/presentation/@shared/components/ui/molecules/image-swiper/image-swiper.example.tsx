'use client';

import ImageSwiper from './image-swiper';

// Example usage of the ImageSwiper component
export default function ImageSwiperExample() {
  const sampleImages = [
    '/images/products/notebook.jpg',
    '/images/products/celular.jpg',
    '/images/products/botin.webp',
    '/images/products/guante.jpg',
    '/images/products/r34.jpg'
  ];

  const responsiveBreakpoints = {
    320: {
      slidesPerView: 1,
      spaceBetween: 10
    },
    768: {
      slidesPerView: 2,
      spaceBetween: 20
    },
    1024: {
      slidesPerView: 3,
      spaceBetween: 30
    }
  };

  return (
    <div className="space-y-8 p-4">
      {/* Basic usage */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Image Swiper</h3>
        <ImageSwiper
          images={sampleImages}
          height="300px"
        />
      </div>

      {/* With custom configuration */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Configured Image Swiper</h3>
        <ImageSwiper
          images={sampleImages}
          slidesPerView={2}
          spaceBetween={20}
          loop={true}
          showIndicators={true}
          showNavigation={true}
          autoplay={{ delay: 3000 }}
          height="400px"
          objectFit="contain"
        />
      </div>

      {/* With responsive breakpoints */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Responsive Image Swiper</h3>
        <ImageSwiper
          images={sampleImages}
          slidesPerView={1}
          spaceBetween={10}
          loop={false}
          showIndicators={true}
          showNavigation={false}
          breakpoints={responsiveBreakpoints}
          height="350px"
          className="rounded-lg overflow-hidden"
        />
      </div>

      {/* Minimal configuration */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Minimal Image Swiper</h3>
        <ImageSwiper
          images={sampleImages}
          showIndicators={false}
          showNavigation={false}
          height="250px"
        />
      </div>
    </div>
  );
}