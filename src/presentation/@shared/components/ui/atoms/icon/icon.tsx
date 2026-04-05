import React from "react";
import { defaultTheme } from "./theme";
import { IconProps } from "./types";

export const Icon: React.FC<IconProps> = ({
  className = "",
  name,
  size = "md",
  variant = "default",
  color,
  theme = defaultTheme,
  onClick}) => {
  const baseClasses = "bi";
  
  const getSizeClass = () => {
    if (size === "md") return "";
    if (size === "sm") return "fs-6";
    if (size === "lg") return "fs-4";
    return "fs-3";
  };
  
  const iconClasses = [
    baseClasses,
    name,
    getSizeClass(),
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Verificar que la variante existe en el tema
  const variantTheme = theme.variants[variant] || theme.variants.default;
  const sizeTheme = theme.sizes[size] || theme.sizes.md;

  const iconStyle = {
    fontSize: sizeTheme.fontSize,
    color: color || variantTheme.color,
    cursor: onClick ? "pointer" : "default",
    transition: "color 0.2s ease-in-out"};

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  if (onClick) {
    return (
      <button
        type="button"
        className={iconClasses}
        style={{
          ...iconStyle,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer'}}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={`Icon ${name}`}
      />
    );
  }

  return (
    <i 
      className={iconClasses}
      style={iconStyle}
    />
  );
};

export default Icon;