import { Product } from "../entities/product";

export interface ProductRemoteDataSource {
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product>;
} 