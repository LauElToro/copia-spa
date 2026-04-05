"use client";

import Lottie from "lottie-react";
import animationData from "../../../../../../../public/files/login.json";

interface registerAnimationProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const registerAnimation = ({ className = "" , width = 300, height = 300 }: registerAnimationProps) => {
  return (
    <div className={className}>
      <Lottie animationData={animationData} loop style={{ width, height }} />
    </div>
  );
};



export default registerAnimation ;