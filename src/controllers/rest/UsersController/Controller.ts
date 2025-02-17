import { Controller, Inject } from "@tsed/di";
import { BodyParams, HeaderParams, PathParams } from "@tsed/platform-params";
import { Delete, Get, Patch, Post, Put, Returns } from "@tsed/schema";
import { User } from "src/entities/UserEntity.js";
import { CreateUserDto, deleteUserResponse, loginResponseDto, loginUserDto, UpdateUserDto } from "src/models/UserModels.js";

import { UsersService } from "./Services.js";

@Controller("/users")
export class UsersController {
  @Inject()
  private readonly usersService: UsersService;

  @Get("/")
  @Returns(200, User)
  async get(@HeaderParams("authorization-token") token: string) {
    return await this.usersService.getAll();
  }

  @Get("/:id")
  async getById(@PathParams("id") id: string, @HeaderParams("authorization-token") token: string) {
    return await this.usersService.getById(id);
  }

  @Post()
  @Returns(201, User)
  async create(@BodyParams() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.createUser(createUserDto);
  }

  @Post("/loginUser")
  @Returns(200, loginResponseDto)
  async loginUser(@BodyParams() loginUserDto: loginUserDto): Promise<loginResponseDto> {
    return await this.usersService.loginUser(loginUserDto);
  }

  @Put("/:id")
  @Returns(200, User)
  async update(
    @PathParams("id") id: string,
    @BodyParams() user: UpdateUserDto,
    @HeaderParams("authorization-token") token: string
  ): Promise<User> {
    return await this.usersService.update(id, user);
  }

  @Patch("/:id")
  @Returns(200, deleteUserResponse)
  async softDelete(@PathParams("id") id: string, @HeaderParams("authorization-token") token: string): Promise<deleteUserResponse> {
    return await this.usersService.softDelete(id);
  }

  @Delete("/:id")
  @Returns(200, deleteUserResponse)
  async remove(@PathParams("id") id: string, @HeaderParams("authorization-token") token: string): Promise<deleteUserResponse> {
    return await this.usersService.remove(id);
  }
}
