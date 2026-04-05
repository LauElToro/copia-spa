"use client";

import Lottie from "lottie-react";
import animationData from "../../../../../../../public/files/join-banner.json";
interface PlanBannerAnimationProps {
  className?: string;
  width?: number;
  height?: number;
}

const PlanBannerAnimation = ({ className = "", width = 500, height = 500 }: PlanBannerAnimationProps) => {
  return (
    <div className={className} style={{ width, height }}>
      <Lottie animationData={animationData} loop />
    </div>
  );
};

export default PlanBannerAnimation;