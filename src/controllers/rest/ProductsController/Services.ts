import { Inject, Injectable } from "@tsed/di";
import { BadRequest, NotFound, Unauthorized } from "@tsed/exceptions";
import { Logger } from "@tsed/logger";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { MssqlDatasource } from "src/datasources/MssqlDatasource.js";
import { Product } from "src/entities/ProductEntity.js";
import { User } from "src/entities/UserEntity.js";
import { CreateProductDto, deleteProductResponse, ProductResponse, UpdateProductDto } from "src/models/ProductModels.js";
import { CreateUserDto, deleteUserResponse, loginResponseDto, loginUserDto, UpdateUserDto } from "src/models/UserModels.js";
import { converBcryptPassword, verifyPassword } from "src/utils/helpers.js";
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
      throw new BadRequest("An error occurred while fetching all users");
    }
  }

  async getById(id: string): Promise<ProductResponse> {
    try {
      const user = await this.productRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFound("User not found");
      }

      return user;
    } catch (error) {
      this.logger.error("UsersServices: ", `getById Error: ${error}`);
      if (error instanceof NotFound) {
        throw new NotFound("User not found");
      }
      throw new BadRequest("An error occurred while fetching the user");
    }
  }

  async createUser(CreateProductDto: CreateProductDto): Promise<ProductResponse> {
    try {
      const userSave = await this.productRepository.save(CreateProductDto);
      return userSave;
    } catch (error) {
      this.logger.error("UsersServices: ", `createUser Error: ${error}`);
      throw new BadRequest("An error occurred while fetching the user");
    }
  }

  async update(id: string, product: Partial<UpdateProductDto>): Promise<ProductResponse> {
    try {
      const existingProduct = await this.productRepository.findOne({ where: { id } });

      if (!existingProduct) {
        throw new NotFound("User not found");
      }

      const updatedUser = this.productRepository.merge(existingProduct, product);
      const data = await this.productRepository.save(updatedUser);
      return data;
    } catch (error) {
      this.logger.error("UsersServices: ", `update Error: ${error}`);
      if (error instanceof NotFound) {
        throw new NotFound("User not found");
      }
      throw new BadRequest("An error occurred while fetching the user");
    }
  }

  async remove(id: string): Promise<deleteProductResponse> {
    try {
      const existingUser = await this.productRepository.findOne({ where: { id } });

      if (!existingUser) {
        throw new NotFound("User not found");
      }

      await this.productRepository.delete(existingUser.id);
      return {
        deleteUser: true,
        message: "User deleted successfully"
      };
    } catch (error) {
      this.logger.error("UsersServices: ", `remove Error: ${error}`);
      if (error instanceof NotFound) {
        throw new NotFound("User not found");
      }
      throw new BadRequest("An error occurred while fetching the user");
    }
  }
}
