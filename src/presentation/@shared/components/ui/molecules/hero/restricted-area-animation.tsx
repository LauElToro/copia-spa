"use client";

import Lottie from "lottie-react";
import animationData from "../../../../../../../public/files/restricted.json";

interface RestrictedAreaAnimationProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const RestrictedAreaAnimation = ({ className = "" , width = 300, height = 300 }: RestrictedAreaAnimationProps) => {
  return (
    <div className={className}>
      <Lottie animationData={animationData} loop style={{ width, height  }}/>
    </div>
  );
};



export default RestrictedAreaAnimation;

