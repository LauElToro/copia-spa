import React from 'react';
import Image from 'next/image';
import { SellerBannerProps } from './types';
import { sellerBannerTheme } from './theme';

export const SellerBanner = ({ title, description, imageUrl }: SellerBannerProps) => {
  return (
    <div className={sellerBannerTheme.container}>
      <Image
        src={imageUrl}
        alt={title}
        fill
        className={sellerBannerTheme.image}
      />
      <div className={sellerBannerTheme.overlay} />
      <div className={sellerBannerTheme.content}>
        <h1 className={sellerBannerTheme.title}>{title}</h1>
        <p className={sellerBannerTheme.description}>{description}</p>
      </div>
    </div>
  );
}; 