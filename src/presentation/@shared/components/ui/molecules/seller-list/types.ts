import { Seller } from '../seller-card/types';

export interface SellerListProps {
  sellers: Seller[];
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
} 