"use client";

import Lottie from "lottie-react";
import animationData from "../../../../../../../public/files/sell-banner.json";

interface sellBannerAnimationProps {
  className?: string;
  width?: number;
  height?: number;
}

const sellBannerAnimation = ({ className = "", width = 500, height = 500 }: sellBannerAnimationProps) => {
  return (
    <div className={className} style={{ width, height }}>
      <Lottie animationData={animationData} loop />
    </div>
  );
};

export default sellBannerAnimation;

