import { Controller, Inject } from "@tsed/di";
import { BodyParams, HeaderParams, PathParams } from "@tsed/platform-params";
import { Delete, Get, Groups, Post, Put, Returns } from "@tsed/schema";
import { ResponseAPi } from "src/models/Response.js";
import { CreateUserDto, loginUserDto, UpdateUserDto } from "src/models/UserModels.js";

import { UsersService } from "./Services.js";

@Controller("/users")
export class UsersController {
  @Inject()
  private readonly usersService: UsersService;

  @Get("/")
  @Returns(200, ResponseAPi)
  async get(@HeaderParams("authorization-token") token: string) {
    console.log(`Token received in GET /users: ${token}`);
    return await this.usersService.getAll();
  }

  @Get("/:id")
  async getById(@PathParams("id") id: string, @HeaderParams("authorization-token") token: string) {
    console.log(`Token received in GET /users/:id: ${token}`);
    return await this.usersService.getById(id);
  }

  @Post()
  @Returns(201, ResponseAPi)
  async create(@BodyParams() @Groups("creation") createUserDto: CreateUserDto): Promise<ResponseAPi> {
    return await this.usersService.createUser(createUserDto);
  }

  @Post("/loginUser")
  @Returns(200, ResponseAPi)
  async loginUser(@BodyParams() loginUserDto: loginUserDto): Promise<ResponseAPi> {
    return await this.usersService.loginUser(loginUserDto);
  }

  @Put("/:id")
  @Returns(200, ResponseAPi)
  async update(
    @PathParams("id") id: string,
    @BodyParams() @Groups("update") user: UpdateUserDto,
    @HeaderParams("authorization-token") token: string
  ): Promise<ResponseAPi> {
    console.log(`Token received in PUT /users/:id: ${token}`);
    return await this.usersService.update(id, user);
  }

  @Delete("/:id")
  @Returns(200, ResponseAPi)
  async remove(@PathParams("id") id: string, @HeaderParams("authorization-token") token: string) {
    console.log(`Token received in DELETE /users/:id: ${token}`);
    return await this.usersService.remove(id);
  }
}
