export interface CardStoreProps {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  delay?: number;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  location?: string;
  phone?: string;
  kyb?: boolean;
  kyc?: boolean;
  plan?: "Starter" | "Liberty" | "Pro Liberty" | "Experiencia Liberty" | "basic" | "standard" | "premium";
}