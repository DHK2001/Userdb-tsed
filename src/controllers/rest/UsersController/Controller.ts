import { Controller, Inject } from "@tsed/di";
import { BodyParams, PathParams } from "@tsed/platform-params";
import { Delete, email, Get, Groups, Post, Put, Returns } from "@tsed/schema";
import { ResponseAPi } from "src/models/Response.js";
import { CreateUserDto, loginUserDto, UpdateUserDto } from "src/models/UserModels.js";

import { UsersService } from "./Services.js";

@Controller("/users")
export class UsersController {
  @Inject()
  private readonly usersService: UsersService;

  @Get("/")
  async get() {
    return await this.usersService.getAll();
  }

  @Get("/:id")
  async getById(@PathParams("id") id: string) {
    return await this.usersService.getById(id);
  }

  @Post()
  @Returns(201)
  async create(@BodyParams() @Groups("creation") createUserDto: CreateUserDto): Promise<ResponseAPi> {
    return await this.usersService.createUser(createUserDto);
  }

  @Post("/loginUser")
  async loginUser(@BodyParams() loginUserDto: loginUserDto): Promise<ResponseAPi> {
    return await this.usersService.loginUser(loginUserDto);
  }

  @Put("/:id")
  async update(@PathParams("id") id: string, @BodyParams() @Groups("update") user: UpdateUserDto): Promise<ResponseAPi> {
    return await this.usersService.update(id, user);
  }

  @Delete("/:id")
  async remove(@PathParams("id") id: string) {
    return await this.usersService.remove(id);
  }
}
