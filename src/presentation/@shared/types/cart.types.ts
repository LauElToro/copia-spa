export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  storeId?: string;
  storeName?: string;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  totalItems: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  summary: CartSummary;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}
