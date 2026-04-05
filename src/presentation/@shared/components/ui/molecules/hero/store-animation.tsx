"use client";

import Lottie from "lottie-react";
import animationData from "../../../../../../../public/files/store.json";

interface StoreAnimationProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const StoreAnimation = ({ className = "", width = 300, height = 300  }: StoreAnimationProps) => {
  return (
    <div className={className}>
      <Lottie animationData={animationData} loop style={{ width, height }} />
    </div>
  );
};

export default StoreAnimation;