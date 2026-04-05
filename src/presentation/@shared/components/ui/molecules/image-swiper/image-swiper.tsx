'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Image } from '../../atoms/image'; 
import { ImageSwiperProps } from './types';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ImageSwiper({
  images,
  slidesPerView = 1,
  spaceBetween = 10,
  loop = false,
  showIndicators = true,
  showNavigation = true,
  autoplay = false,
  breakpoints,
  className = '',
  imageClassName = '',
  height = '400px',
  objectFit = 'fill',
  imageWidth= 300,
  imageHeight= 100
}: Readonly<ImageSwiperProps>) {
  const modules = [
    ...(showNavigation ? [Navigation] : []),
    ...(showIndicators ? [Pagination] : []),
    ...(autoplay ? [Autoplay] : [])
  ];

  return (
    <div className={`image-swiper ${className}`} style={{ height }}>
      <Swiper
        modules={modules}
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        loop={loop}
        navigation={showNavigation}
        pagination={showIndicators ? { clickable: true } : false}
        autoplay={autoplay}
        breakpoints={breakpoints}
        className="h-100"
      >
        {images.map((image, index) => (
          <SwiperSlide key={`${image}-${index}`}>
            <div>
              <Image
                src={image}
                alt={`Slide ${index + 1}`}
                className={`${imageClassName}`}
                objectFit={objectFit}
                width={imageWidth}
                height={imageHeight}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}