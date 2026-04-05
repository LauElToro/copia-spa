"use client";

import Lottie from "lottie-react";
import animationData from "../../../../../../../public/files/categories.json";

interface CategoriesAnimationProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const CategoriesAnimation = ({ className = "", width = 300, height = 300 }: CategoriesAnimationProps) => {
  return (
    <div className={className}>
      <Lottie animationData={animationData} loop style={{ width, height }}/>
    </div>
  );
};

export default CategoriesAnimation;


