import React from 'react';
import Image from 'next/image';
import type { HeroBannerProps } from './types';
import { heroBannerTheme } from './theme';

export const HeroBanner: React.FC<HeroBannerProps> = ({ title, description, imageUrl }) => {
  return (
    <div className={heroBannerTheme.container}>
      <Image
        src={imageUrl}
        alt={title}
        fill
        className={heroBannerTheme.image}
      />
      <div className={heroBannerTheme.overlay} />
      <div className={heroBannerTheme.content}>
        <h1 className={heroBannerTheme.title}>{title}</h1>
        <p className={heroBannerTheme.description}>{description}</p>
      </div>
    </div>
  );
}; 