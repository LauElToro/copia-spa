'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Box } from '@mui/material';
import { Image } from '../../atoms/image';

import 'swiper/css';

interface FooterSliderProps {
  images?: string[];
}

const DEFAULT_IMAGES = [
  "/images/binance.svg",
  "/images/btc.svg",
  "/images/eth.svg",
  "/images/tron.svg",
  "/images/poly.svg",
  "/images/mc.svg",
  "/images/visa.svg",
];

const FooterSlider: React.FC<FooterSliderProps> = ({ images = DEFAULT_IMAGES }) => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden"
      }}
    >
      <Swiper
        modules={[Autoplay]}
        slidesPerView={5}
        spaceBetween={40}
        loop={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          320: {
            slidesPerView: 2,
            spaceBetween: 20
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 30
          },
          920: {
            slidesPerView: 4,
            spaceBetween: 40
          },
          1200: {
            slidesPerView: 5,
            spaceBetween: 40
          }
        }}
        style={{
          width: "100%",
          paddingBottom: "20px"
        }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={`${image}-${index}`}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.8,
                transition: "opacity 0.3s ease",
                "&:hover": {
                  opacity: 1
                }
              }}
            >
              <Image
                src={image}
                alt={`Payment method ${index + 1}`}
                width={160}
                height={160}
                objectFit="contain"
                className="img-responsive"
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default FooterSlider;
