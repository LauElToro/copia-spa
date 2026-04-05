"use client";

import React, { useState } from 'react';

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  rating,
  onRatingChange,
  maxStars = 5,
  size = 'md',
  disabled = false,
}) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const starSizes = {
    sm: { width: '24px', height: '24px' },
    md: { width: '32px', height: '32px' },
    lg: { width: '40px', height: '40px' }
  };

  const handleStarClick = (starValue: number) => {
    if (!disabled) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue: number) => {
    if (!disabled) {
      setHoveredRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoveredRating(null);
    }
  };

  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  return (
    <div 
      className="d-flex align-items-center gap-1"
      onMouseLeave={handleMouseLeave}
      style={{ cursor: disabled ? 'default' : 'pointer' }}
    >
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        const isFilled = displayRating >= starValue;
        
        return (
          <svg
            key={index}
            style={starSizes[size]}
            fill={isFilled ? '#ffc107' : '#dee2e6'}
            viewBox="0 0 20 20"
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            className={disabled ? '' : 'star-rating-hover'}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
      {!disabled && (
        <span className="ms-2 text-white-50" style={{ fontSize: '0.9rem' }}>
          {displayRating > 0 ? `${displayRating} de ${maxStars}` : 'Selecciona una calificación'}
        </span>
      )}
    </div>
  );
};

export default StarRatingInput;

