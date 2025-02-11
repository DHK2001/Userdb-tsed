import { Controller, Inject } from "@tsed/di";
import { BodyParams, HeaderParams, PathParams } from "@tsed/platform-params";
import { Delete, Get, Post, Put, Returns } from "@tsed/schema";
import { CreateOrderDto, DeleteOrderResponse, OrderResponse, UpdateOrderDto } from "src/models/OrderModels.js";

import { OrderService } from "./Services.js";

@Controller("/orders")
export class OrderController {
  @Inject()
  private readonly ordersService: OrderService;

  @Get("/")
  @Returns(200, OrderResponse)
  async get(@HeaderParams("authorization-token") token: string) {
    return await this.ordersService.getAll();
  }

  @Get("/:id")
  async getById(@PathParams("id") id: string, @HeaderParams("authorization-token") token: string) {
    return await this.ordersService.getById(id);
  }

  @Post()
  @Returns(201, OrderResponse)
  async create(@BodyParams() createOrder: CreateOrderDto, @HeaderParams("authorization-token") token: string): Promise<OrderResponse> {
    return await this.ordersService.createOrder(createOrder);
  }

  @Put("/:id")
  @Returns(200, OrderResponse)
  async update(
    @PathParams("id") id: string,
    @BodyParams() order: UpdateOrderDto,
    @HeaderParams("authorization-token") token: string
  ): Promise<OrderResponse> {
    return await this.ordersService.update(id, order);
  }

  @Delete("/:id")
  @Returns(200, DeleteOrderResponse)
  async remove(@PathParams("id") id: string, @HeaderParams("authorization-token") token: string): Promise<DeleteOrderResponse> {
    return await this.ordersService.remove(id);
  }
}
