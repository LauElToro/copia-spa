'use client';

import React, { useMemo } from 'react';
import { FaHeart } from 'react-icons/fa';
import { useFavorites } from '../../../../hooks/use-favorites';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useRouter } from 'next/navigation';
import { useOptionalAuthContext } from '@/presentation/@shared/contexts/auth-context';

interface FavoritesIconProps {
  className?: string;
  size?: number;
  showBadge?: boolean;
}

const FavoritesIcon: React.FC<FavoritesIconProps> = ({
  className = '',
  size = 20,
  showBadge = true
}) => {
  const { totalItems } = useFavorites();
  const { t } = useLanguage();
  const router = useRouter();
  const authContext = useOptionalAuthContext();
  const isAuthenticated = authContext?.isAuthenticated ?? false;
  const authLoading = authContext?.isLoading ?? false;

  const badgeContent = useMemo(() => {
    if (!showBadge || totalItems <= 0) return null;
    return totalItems > 99 ? '99+' : totalItems;
  }, [showBadge, totalItems]);

  const handleClick = () => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/auth/login-required?redirect=${encodeURIComponent('/favorites')}`);
      return;
    }

    router.push('/favorites');
  };

  return (
    <button
      type="button"
      className="border-0 bg-transparent"
      onClick={handleClick}
      aria-label={t.tooltips.goToFavorites}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <FaHeart
        size={size}
        className={`favorites-icon ${className}`}
        style={{
          color: '#fff',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
      />

      {badgeContent && (
        <span className="favorites-badge">
          {badgeContent}
        </span>
      )}

      <style>{`
        .favorites-icon:hover {
          color: #ff4757 !important;
        }

        .favorites-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: linear-gradient(135deg, #ff4757, #ff3742);
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border: 2px solid #000;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
          }
          70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 10px rgba(255, 71, 87, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 71, 87, 0);
          }
        }
      `}</style>
    </button>
  );
};

export default FavoritesIcon;
