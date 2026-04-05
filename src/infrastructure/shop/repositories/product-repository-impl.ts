import { Product } from "@/domain/shop/entities/product";
import { ProductLocalDataSourceImpl } from "../datasources/product-local-data-source";
import { ProductRepository } from "@/domain/shop/repositories/product-repository";
import { ProductRemoteDataSource } from "../../../domain/shop/datasources/product-remote-data-source";
import { ProductDto } from "../dtos/product-dto";

export class ProductRepositoryImpl implements ProductRepository {
  private readonly productLocalDataSource = new ProductLocalDataSourceImpl();

  constructor(private readonly remoteDataSource: ProductRemoteDataSource) {}

  async getProducts(): Promise<Product[]> {
    try {
      return await this.remoteDataSource.getProducts();
    } catch {
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      return await this.remoteDataSource.getProductById(id);
    } catch {
      return null;
    }
  }

  async getOneProductById(id: string): Promise<Product> {
    try {
      const product = await this.remoteDataSource.getProductById(id);
      // Save to cache for future offline access
      this.productLocalDataSource.saveOneProductInCache(ProductDto.fromDomain(product));
      return product;
    } catch {
      const cachedProduct = this.productLocalDataSource.getOneProductByIdFromCache(id);
      return cachedProduct.toDomain();
    }
  }
}
