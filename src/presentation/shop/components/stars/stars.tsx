"use client";

import React from "react";

interface StarsProps {
  rating: number;
  totalStars?: number;
  size?: number;
}

const Stars: React.FC<StarsProps> = ({ rating, totalStars = 5, size = 20 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  const starStyle = { width: size, height: size };

  return (
    <div className="d-flex align-items-center gap-1">
      {Array.from({ length: fullStars }).map((_, idx) => (
        <svg key={`full-star-${idx}-${rating}`} viewBox="0 0 24 24" fill="#FFD700" style={starStyle}>
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.78 1.401 8.169L12 18.897l-7.335 3.862 1.401-8.169-5.934-5.78 8.2-1.192z"/>
        </svg>
      ))}
      {halfStar && (
        <svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" style={starStyle}>
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="#FFD700"/>
              <stop offset="50%" stopColor="#ddd"/>
            </linearGradient>
          </defs>
          <path fill="url(#halfGrad)" d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.78 1.401 8.169L12 18.897l-7.335 3.862 1.401-8.169-5.934-5.78 8.2-1.192z"/>
        </svg>
      )}
      {Array.from({ length: emptyStars }).map((_, idx) => (
        <svg key={`empty-star-${idx}-${rating}`} viewBox="0 0 24 24" fill="#ddd" style={starStyle}>
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.78 1.401 8.169L12 18.897l-7.335 3.862 1.401-8.169-5.934-5.78 8.2-1.192z"/>
        </svg>
      ))}
      <span className="ms-1">{rating.toFixed(1)}</span>
    </div>
  );
};

export default Stars;
