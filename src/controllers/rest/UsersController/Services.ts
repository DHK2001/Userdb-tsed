import { Inject, Injectable } from "@tsed/di";
import { MssqlDatasource } from "src/datasources/MssqlDatasource.js";
import { User } from "src/entities/UserEntity.js";
import { CreateUserDto } from "src/models/CreateUserDto.js";
import { ResponseAPi } from "src/models/Response.js";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UsersService {
  @Inject(MssqlDatasource)
  protected mysqlDataSource: DataSource;
  private usersRepository: Repository<User>;

  async $onInit() {
    if (this.mysqlDataSource.isInitialized) {
      console.log("Connected with typeorm to database: Mssql");
      this.usersRepository = this.mysqlDataSource.getRepository(User);
    } else {
      console.error("Datasource not connected");
      throw new Error("Datasource not connected");
    }
  }

  async getAll(): Promise<ResponseAPi> {
    try {
      const users = await this.usersRepository.find();
      return {
        success: true,
        message: "Users found",
        data: users,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        message: "Error getting users",
        data: null,
        error: error.message
      };
    }
  }

  async getById(id: string): Promise<ResponseAPi> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        return {
          success: false,
          message: "User not found",
          data: null,
          error: `The user with the id ${id} does not exist.`
        };
      }
      return {
        success: true,
        message: "User found",
        data: user,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        message: "Error getting user",
        data: null,
        error: error.message
      };
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<ResponseAPi> {
    try {
      const userCreated = await this.usersRepository.save(createUserDto);
      const createdUser = {
        id: userCreated.id,
        firstName: userCreated.firstName,
        lastName: userCreated.lastName,
        email: userCreated.email,
        creationDate: userCreated.creationDate
      };
      return {
        success: true,
        message: "User created",
        data: createdUser,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        message: "Error creating user",
        data: null,
        error: error.message
      };
    }
  }

  async update(id: string, user: Partial<CreateUserDto>): Promise<ResponseAPi> {
    try {
      const existingUser = await this.usersRepository.findOne({ where: { id } });

      if (!existingUser) {
        return {
          success: false,
          message: "User not found",
          data: null,
          error: `The user with the id ${id} does not exist.`
        };
      }

      const updatedUser = this.usersRepository.merge(existingUser, user);

      const data = await this.usersRepository.save(updatedUser);
      return {
        success: true,
        message: "User updated",
        data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        message: "Error updating user",
        data: null,
        error: error.message
      };
    }
  }

  async remove(id: string): Promise<ResponseAPi> {
    try {
      const existingUser = await this.usersRepository.findOne({ where: { id } });
      if (!existingUser) {
        return {
          success: false,
          message: "User not found",
          data: null,
          error: `The user with the id ${id} does not exist.`
        };
      }
      const data = await this.usersRepository.delete(existingUser.id);
      return {
        success: true,
        message: "User deleted",
        data: null,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        message: "Error deleting user",
        data: null,
        error: error.message
      };
    }
  }
}
