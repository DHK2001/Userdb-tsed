import { Inject, Injectable } from "@tsed/di";
import { BadRequest, NotFound } from "@tsed/exceptions";
import { Logger } from "@tsed/logger";
import * as dotenv from "dotenv";
import { MssqlDatasource } from "src/datasources/MssqlDatasource.js";
import { Product } from "src/entities/ProductEntity.js";
import { CreateProductDto, deleteProductResponse, ProductResponse, UpdateProductDto } from "src/models/ProductModels.js";
import { DataSource, Repository } from "typeorm";

dotenv.config();

@Injectable()
export class ProducstService {
  @Inject()
  logger: Logger;
  @Inject(MssqlDatasource)
  protected mysqlDataSource: DataSource;
  private productRepository: Repository<Product>;

  async $onInit() {
    if (this.mysqlDataSource.isInitialized) {
      this.productRepository = this.mysqlDataSource.getRepository(Product);
    } else {
      throw new Error("Datasource not connected");
    }
  }

  async getAll(): Promise<ProductResponse[]> {
    try {
      const users = await this.productRepository.find();
      return users;
    } catch (error) {
      this.logger.error("UsersServices: ", `getAll Error: ${error}`);
      throw new BadRequest("An error occurred while fetching all products");
    }
  }

  async getById(id: string): Promise<ProductResponse> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });

      if (!product) {
        throw new NotFound("Product not found");
      }

      return product;
    } catch (error) {
      this.logger.error("UsersServices: ", `getById Error: ${error}`);
      if (error instanceof NotFound) {
        throw new NotFound("Product not found");
      }
      throw new BadRequest("An error occurred while fetching the product");
    }
  }

  async createProduct(createProductDto: CreateProductDto): Promise<ProductResponse> {
    try {
      const product = await this.productRepository.findOne({ where: { name: createProductDto.name } });

      if (product) {
        throw new BadRequest("Product already exists");
      }

      const productSave = await this.productRepository.save(createProductDto);
      return productSave;
    } catch (error) {
      this.logger.error("UsersServices: ", `createUser Error: ${error}`);
      throw new BadRequest("An error occurred while fetching the ptoduct");
    }
  }

  async update(id: string, product: Partial<UpdateProductDto>): Promise<ProductResponse> {
    try {
      const existingProduct = await this.productRepository.findOne({ where: { id } });

      if (!existingProduct) {
        throw new NotFound("Product not found");
      }

      const updatedUser = this.productRepository.merge(existingProduct, product);
      const data = await this.productRepository.save(updatedUser);
      return data;
    } catch (error) {
      this.logger.error("UsersServices: ", `update Error: ${error}`);
      if (error instanceof NotFound) {
        throw new NotFound("Product not found");
      }
      throw new BadRequest("An error occurred while fetching the product");
    }
  }

  async remove(id: string): Promise<deleteProductResponse> {
    try {
      const existingUser = await this.productRepository.findOne({ where: { id } });

      if (!existingUser) {
        throw new NotFound("Product not found");
      }

      await this.productRepository.delete(existingUser.id);
      return {
        deleteUser: true,
        message: "Product deleted successfully"
      };
    } catch (error) {
      this.logger.error("UsersServices: ", `remove Error: ${error}`);
      if (error instanceof NotFound) {
        throw new NotFound("Procut not found");
      }
      throw new BadRequest("An error occurred while fetching the product");
    }
  }
}
