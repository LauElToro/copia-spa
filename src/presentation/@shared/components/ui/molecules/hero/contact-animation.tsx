"use client";

import Lottie from "lottie-react";
import animationData from "../../../../../../../public/files/contacto.json";

interface ContactAnimationProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const ContactAnimation = ({ className = "", width = 300, height = 300 }: ContactAnimationProps) => {
  return (
    <div className={className}>
      <Lottie animationData={animationData} loop style={{ width, height }}/>
    </div>
  );
};

export default ContactAnimation;

