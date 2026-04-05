export interface Seller {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rating: number;
  category: string;
}

export interface SellerCardProps {
  seller: Seller;
} 