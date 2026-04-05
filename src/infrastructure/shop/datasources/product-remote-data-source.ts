import { ProductRemoteDataSource } from "../../../domain/shop/datasources/product-remote-data-source";
import { Product } from "../../../domain/shop/entities/product";

export class ProductRemoteDataSourceImpl implements ProductRemoteDataSource {
  async getProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
      // Simulación de llamada a API
      setTimeout(() => {
        resolve([
          new Product(
            "1",
            "Product 1",
            "Description 1",
            100,
            "category1",
            10
          ),
          new Product(
            "2",
            "Product 2",
            "Description 2",
            200,
            "category2",
            5
          ),
        ]);
      }, 1000);
    });
  }

  async getProductById(id: string): Promise<Product> {
    return new Promise((resolve) => {
      // Simulación de llamada a API
      setTimeout(() => {
        resolve(
          new Product(
            id,
            `Product ${id}`,
            `Description ${id}`,
            100 * Number.parseInt(id),
            `category${id}`,
            10
          )
        );
      }, 1000);
    });
  }
}
