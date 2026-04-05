"use client";

import React from "react";
import { Text } from "../../atoms/text";
import { Button } from "../../atoms/button";
import { Image } from "../../atoms/image/image";
import Link from "next/link";

export interface HeroBannerProps {
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  className?: string;
  width?: number;
  height?: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  description,
  image,
  ctaText,
  ctaLink,
  className = "",
  width = 600,
  height = 400}) => {
  return (
    <div className={`hero-banner ${className}`}>
      <div className="hero-content">
        <Text variant="h1" className="hero-title">
          {title}
        </Text>
        <Text variant="p" className="hero-description">
          {description}
        </Text>
        <Link href={ctaLink} passHref legacyBehavior>
          <Button variant="primary" className="hero-cta">
            {ctaText}
          </Button>
        </Link>
        <Link href={ctaLink} passHref legacyBehavior>
          <Button variant="danger" className="hero-cta">
            {ctaText}
          </Button>
        </Link>
      </div>
      <div className="hero-image">
        <Image src={image} alt={title} className="w-full h-full" width={width} height={height} />
      </div>
    </div>
  );
};

export default HeroBanner;
