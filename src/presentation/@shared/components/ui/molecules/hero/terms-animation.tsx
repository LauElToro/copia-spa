"use client";

import Lottie from "lottie-react";
import animationData from "../../../../../../../public/files/term.json";

interface TermsAnimationProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const TermsAnimation = ({ className = "", width = 300, height = 300 }: TermsAnimationProps) => {
  return (
    <div className={className}>
      <Lottie animationData={animationData} loop style={{ width, height  }}/>
    </div>
  );
};

export default TermsAnimation;