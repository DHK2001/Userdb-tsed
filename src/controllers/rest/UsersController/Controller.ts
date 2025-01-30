import { Controller, Inject } from "@tsed/di";
import { BodyParams, PathParams } from "@tsed/platform-params";
import { Delete, Get, Groups, Post, Put, Returns } from "@tsed/schema";
import { CreateUserDto } from "src/models/CreateUserDto.js";
import { ResponseAPi } from "src/models/Response.js";

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
  getById(@PathParams("id") id: string) {
    return this.usersService.getById(id);
  }

  @Post()
  @Returns(201)
  async create(@BodyParams() @Groups("creation") createUserDto: CreateUserDto): Promise<ResponseAPi> {
    return await this.usersService.createUser(createUserDto);
  }

  @Put("/:id")
  async update(@PathParams("id") id: string, @BodyParams() @Groups("update") user: CreateUserDto): Promise<ResponseAPi> {
    return await this.usersService.update(id, user);
  }

  @Delete("/:id")
  async remove(@PathParams("id") id: string) {
    return await this.usersService.remove(id);
  }
}
