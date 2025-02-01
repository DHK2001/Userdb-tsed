import { Inject, Injectable } from "@tsed/di";
import { BadRequest, NotFound, Unauthorized } from "@tsed/exceptions";
import { Logger } from "@tsed/logger";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { MssqlDatasource } from "src/datasources/MssqlDatasource.js";
import { User } from "src/entities/UserEntity.js";
import { ResponseAPi } from "src/models/Response.js";
import { CreateUserDto, loginUserDto, UpdateUserDto } from "src/models/UserModels.js";
import { converBcryptPassword, verifyPassword } from "src/utils/helpers.js";
import { DataSource, Repository } from "typeorm";

dotenv.config();

@Injectable()
export class UsersService {
  @Inject()
  logger: Logger;
  @Inject(MssqlDatasource)
  protected mysqlDataSource: DataSource;
  private usersRepository: Repository<User>;

  async $onInit() {
    if (this.mysqlDataSource.isInitialized) {
      this.usersRepository = this.mysqlDataSource.getRepository(User);
    } else {
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
      this.logger.error("UsersServices: ", `getAll Error: ${error}`);
      throw new BadRequest("An error occurred while fetching all users");
    }
  }

  async getById(id: string): Promise<ResponseAPi> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFound("User not found");
      }

      return {
        success: true,
        message: "User found",
        data: user,
        error: null
      };
    } catch (error) {
      this.logger.error("UsersServices: ", `getById Error: ${error}`);
      if (error instanceof NotFound) {
        throw new NotFound("User not found");
      }
      throw new BadRequest("An error occurred while fetching the user");
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<ResponseAPi> {
    try {
      const hashedPassword = await converBcryptPassword(createUserDto.password);
      const createUser = {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password_bcrypt: hashedPassword
      };
      const userSave = await this.usersRepository.save(createUser);
      return {
        success: true,
        message: "User created",
        data: userSave,
        error: null
      };
    } catch (error) {
      this.logger.error("UsersServices: ", `createUser Error: ${error}`);
      throw new BadRequest("An error occurred while fetching the user");
    }
  }

  async update(id: string, user: Partial<UpdateUserDto>): Promise<ResponseAPi> {
    try {
      const existingUser = await this.usersRepository.findOne({ where: { id } });

      if (!existingUser) {
        throw new NotFound("User not found");
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
      this.logger.error("UsersServices: ", `update Error: ${error}`);
      if (error instanceof NotFound) {
        throw new NotFound("User not found");
      }
      throw new BadRequest("An error occurred while fetching the user");
    }
  }

  async loginUser(loginUserDto: loginUserDto): Promise<ResponseAPi> {
    try {
      const user = await this.usersRepository.findOne({ where: { email: loginUserDto.email } });

      if (!user) {
        throw new NotFound("User not found");
      }

      const isMatch = await verifyPassword(loginUserDto.password, user.password_bcrypt);

      if (isMatch) {
        const secretKey = process.env.SECRET_KEY;
        const payloadToken = {
          id: user.id,
          email: user.email,
          password: user.password_bcrypt
        };

        const token = jwt.sign(payloadToken, secretKey ?? "", {
          expiresIn: "1h"
        });

        return {
          success: true,
          message: "User logged in",
          data: {
            accessToken: token
          },
          error: null
        };
      } else {
        throw new Unauthorized("Invalid credentials");
      }
    } catch (error) {
      this.logger.error("UsersServices: ", `loginUser Error: ${error}`);
      if (error instanceof NotFound) {
        throw new NotFound("User not found");
      }
      if (error instanceof Unauthorized) {
        throw new Unauthorized("Invalid credentials");
      }
      throw new BadRequest("An error occurred while fetching the user");
    }
  }

  async remove(id: string): Promise<ResponseAPi> {
    try {
      const existingUser = await this.usersRepository.findOne({ where: { id } });

      if (!existingUser) {
        throw new NotFound("User not found");
      }

      await this.usersRepository.delete(existingUser.id);
      return {
        success: true,
        message: "User deleted",
        data: null,
        error: null
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
