"use client";

import Lottie from "lottie-react";
import animationData from "../../../../../../../public/files/invitacion.json";

interface LoginAnimationProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const LoginAnimation = ({ className = "", width = 300, height = 300  }: LoginAnimationProps) => {
  return (
    <div className={className}>
      <Lottie animationData={animationData} loop style={{ width, height }}/>
    </div>
  );
};



export default LoginAnimation ;