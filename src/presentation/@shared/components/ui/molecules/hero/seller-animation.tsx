"use client";

import Lottie from "lottie-react";
import animationData from "../../../../../../../public/files/sell.json";

interface SellerAnimationProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const SellerAnimation = ({ className = "", width = 300, height = 300 }: SellerAnimationProps) => {
  return (
    <div className={className} >
      <Lottie animationData={animationData} loop style={{ width, height }}/>
    </div>
  );
};

export default SellerAnimation;