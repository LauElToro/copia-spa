import React from 'react';
import { Text } from '../../atoms/text';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  textVariant?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  showValue = true,
  textVariant='p'}) => {
  const starSizes = {
    sm: { width: '12px', height: '12px' },
    md: { width: '16px', height: '16px' },
    lg: { width: '20px', height: '20px' }
  };

  return (
    <div className="d-flex align-items-center">
      {showValue && (
        <Text className="mx-2" variant={textVariant}>{rating}</Text>
      )}
      <div className="d-flex">
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1;
          const isFilled = rating >= starValue;
          
          return (
            <svg
              key={index}
              style={starSizes[size]}
              fill={isFilled ? '#ffc107' : '#dee2e6'}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        })}
      </div>
    </div>
  );
};

export default StarRating;