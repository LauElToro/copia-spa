import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { SellerCardProps } from './types';
import { sellerCardTheme } from './theme';
import { useRouter } from 'next/navigation';

export const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  const { name, rating, description, imageUrl, id } = seller;
  const router = useRouter();
  
  return (
    <div className={sellerCardTheme.container}>
      {/* Banner Image */}
      <div className={sellerCardTheme.imageContainer}>
        <Image
          src={imageUrl}
          alt={`${name} banner`}
          fill
          className={sellerCardTheme.image}
        />
      </div>

      {/* Profile Section */}
      <div className={sellerCardTheme.content}>
        <div className={sellerCardTheme.header}>
          <h3 className={sellerCardTheme.title}>{name}</h3>
          <div className={sellerCardTheme.rating}>
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={`star-${name}-${i}`} className={sellerCardTheme.star} data-testid="star" fill="currentColor" />
            ))}
          </div>
        </div>

        <p className={sellerCardTheme.description}>{description}</p>

        <button 
          className={sellerCardTheme.button}
          onClick={() => router.push(`/stores/${id}`)}
        >
          Visitar Tienda
        </button>
      </div>
    </div>
  );
}; 