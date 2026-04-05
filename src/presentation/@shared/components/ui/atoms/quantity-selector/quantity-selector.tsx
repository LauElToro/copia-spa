import React from 'react';
import { QuantitySelectorProps } from './types';
import { quantitySelectorTheme } from './theme';
import { FaMinus, FaPlus } from 'react-icons/fa';

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value = 1,
  min = 1,
  max = 99,
  onChange,
  size = "md",
  theme = quantitySelectorTheme,
  className = "",
  disabled = false,
  ...props
}) => {
  const handleIncrement = () => {
    if (!disabled && value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (!disabled && value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseInt(e.target.value) || min;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const containerClasses = [
    theme.base,
    (theme as Record<string, Record<string, string>>).sizes?.[size],
    className
  ].filter(Boolean).join(' ');

  const buttonClasses = [
    (theme as Record<string, Record<string, string>>).button?.base,
    (theme as Record<string, Record<string, Record<string, string>>>).button?.sizes?.[size],
    disabled ? (theme as Record<string, Record<string, string>>).button?.disabled : (theme as Record<string, Record<string, string>>).button?.enabled
  ].filter(Boolean).join(' ');

  const inputClasses = [
    (theme as Record<string, Record<string, string>>).input?.base,
    (theme as Record<string, Record<string, Record<string, string>>>).input?.sizes?.[size],
    disabled ? (theme as Record<string, Record<string, string>>).input?.disabled : (theme as Record<string, Record<string, string>>).input?.enabled
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={{ backgroundColor: "#f0f0f0", borderRadius: "20px" }} {...props}>
      <button
        type="button"
        className={buttonClasses}
        onClick={handleDecrement}
        disabled={disabled || value <= min}
      >
        <FaMinus size={12} />
      </button>
      
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className={inputClasses}
        disabled={disabled}
      />
      
      <button
        type="button"
        className={buttonClasses}
        onClick={handleIncrement}
        disabled={disabled || value >= max}
      >
        <FaPlus size={12} />
      </button>
    </div>
  );
};
