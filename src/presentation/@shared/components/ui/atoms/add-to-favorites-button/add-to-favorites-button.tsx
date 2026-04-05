'use client';

import React, { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

export interface AddToFavoritesButtonProps {
  onClick: () => void;
  isFavorite?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const AddToFavoritesButton: React.FC<AddToFavoritesButtonProps> = ({
  onClick,
  isFavorite = false,
  className = '',
  size = 'md',
  disabled = false
}) => {
  const [showToast, setShowToast] = useState(false);

  const iconSizes = { sm: 18, md: 22, lg: 26 };

  const handleClick = () => {
    onClick();

    if (!isFavorite) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
    }
  };

  return (
    <div className="fav-wrapper">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`fav-icon-btn ${className}`}
      >
        {isFavorite ? (
          <FaHeart size={iconSizes[size]} color="#ff4b5c" />
        ) : (
          <FaRegHeart size={iconSizes[size]} color="#ffffff" />
        )}
      </button>

      {showToast && (
        <div className="fav-toast">
          Producto agregado a favoritos
        </div>
      )}

      <style>{`
        .fav-icon-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }
        .fav-icon-btn:hover {
          opacity: 0.8;
        }
        .fav-wrapper {
          position: relative;
          width: max-content;
        }
        .fav-toast {
          position: absolute;
          top: -35px;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: #fff;
          padding: 6px 10px;
          font-size: 0.8rem;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0.95;
          animation: fadeInOut 1.8s ease;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 0.95; }
          80% { opacity: 0.95; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AddToFavoritesButton;
