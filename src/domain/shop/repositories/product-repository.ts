import { Product } from "../entities/product";

export interface ProductRepository {
  getOneProductById(id: string): Promise<Product>;
}
