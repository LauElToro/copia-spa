import { ProductRepositoryImpl } from "@/infrastructure/shop/repositories/product-repository-impl";
import { ProductRepository } from "../repositories/product-repository";
import { Product } from "../entities/product";
import { ProductRemoteDataSourceImpl } from "@/infrastructure/shop/datasources/product-remote-data-source";

interface GetOneProductByIdParams {
  id: string;
}

export class GetOneProductById {
  // Replace with injection in the future
  productRepository: ProductRepository = new ProductRepositoryImpl(new ProductRemoteDataSourceImpl());

  async execute(params: GetOneProductByIdParams): Promise<Product> {
    // Params validation (Input)
    if (!params.id) {
      throw new Error("Product id is required");
    }
    // Business logic
    const product = await this.productRepository.getOneProductById(params.id);
    if (!product) {
      throw new Error("Product not found");
    }
    if (!product.hasStock()) {
      throw new Error("Product out of stock");
    }
    if (!product.isValid()) {
      throw new Error("Product is not valid");
    }

    // Return value (Output)
    return product;
  }
}
