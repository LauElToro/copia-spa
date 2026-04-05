import React from 'react';
import { CounterProps } from './types';
import { counterTheme } from './theme';

export const Counter: React.FC<CounterProps> = ({ 
  count, 
  variant = "default", 
  size = "md",
  theme = counterTheme,
  className = "",
  ...props 
}) => {
  const counterClasses = [
    theme.base,
    theme.variants[variant],
    theme.sizes[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <span 
      className={counterClasses}
      {...props}
    >
      {count}
    </span>
  );
};
