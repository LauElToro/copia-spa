'use client';

import React, { useMemo } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../../../hooks/use-cart';
import { useProfile } from '@/presentation/@shared/hooks/use-profile';
import { useRouter } from 'next/navigation';

interface CartIconProps {
  className?: string;
  size?: number;
}

const CartIcon: React.FC<CartIconProps> = ({ className = '', size = 20 }) => {
  const { totalItems, openCart } = useCart();
  const { isAuthenticated } = useProfile();
  const router = useRouter();

  const badgeContent = useMemo(() => {
    if (totalItems <= 0) return null;
    return totalItems > 99 ? '99+' : totalItems;
  }, [totalItems]);

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login-required?redirect=/cart');
      return;
    }
    openCart();
  };

  return (
    <button
      type="button"
      className="border-0 bg-transparent"
      onClick={handleClick}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <FaShoppingCart
        size={size}
        className={`cart-icon ${className}`}
        style={{
          color: '#fff',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
      />

      {badgeContent && (
        <span className="cart-badge">
          {badgeContent}
        </span>
      )}

      <style>{`
        .cart-icon:hover {
          color: #19e97c;
        }

        .cart-badge {
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

export default CartIcon;
