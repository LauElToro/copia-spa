"use client";

import Lottie from "lottie-react";
import animationData from "../../../../../../../public/files/home-banner.json";

interface HomeAnimationProps {
  className?: string;
  width?: number;
  height?: number;
}

const HomeAnimation = ({ className = "", width = 500, height = 500 }: HomeAnimationProps) => {
  return (
    <div className={className} style={{ width, height }}>
      <Lottie animationData={animationData} loop />
    </div>
  );
};

export default HomeAnimation;