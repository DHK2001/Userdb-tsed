import { Inject, Injectable } from "@tsed/di";
import { BadRequest, NotFound } from "@tsed/exceptions";
import { Logger } from "@tsed/logger";
import { MssqlDatasource } from "src/datasources/MssqlDatasource.js";
import { Order } from "src/entities/OrderEntity.js";
import { Product } from "src/entities/ProductEntity.js";
import { User } from "src/entities/UserEntity.js";
import { CreateOrderDto, DeleteOrderResponse, OrderResponse, UpdateOrderDto } from "src/models/OrderModels.js";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class OrderService {
  @Inject()
  logger!: Logger;

  @Inject(MssqlDatasource)
  private mysqlDataSource!: DataSource;

  private orderRepository!: Repository<Order>;
  private userRepository!: Repository<User>;
  private productRepository!: Repository<Product>;

  async $onInit() {
    if (this.mysqlDataSource.isInitialized) {
      this.orderRepository = this.mysqlDataSource.getRepository(Order);
      this.userRepository = this.mysqlDataSource.getRepository(User);
      this.productRepository = this.mysqlDataSource.getRepository(Product);
    } else {
      throw new Error("Datasource not connected");
    }
  }

  async getAll(): Promise<OrderResponse[]> {
    try {
      const orders = await this.orderRepository.find({ relations: ["user"] });
      return orders.map((order) => ({
        id: order.id,
        userId: order.user.id,
        productDetails: order.productDetails,
        totalAmount: order.totalAmount,
        orderDate: order.orderDate
      }));
    } catch (error) {
      this.logger.error("OrderService: getAll Error:", error);
      throw new BadRequest("Error fetching orders");
    }
  }

  async getById(id: string): Promise<OrderResponse> {
    try {
      const order = await this.orderRepository.findOne({ where: { id }, relations: ["user"] });
      if (!order) {
        throw new NotFound("Order not found");
      }
      return {
        id: order.id,
        userId: order.user.id,
        productDetails: order.productDetails,
        totalAmount: order.totalAmount,
        orderDate: order.orderDate
      };
    } catch (error) {
      this.logger.error("OrderService: getById Error:", error);
      throw error instanceof NotFound ? error : new BadRequest("Error fetching order");
    }
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponse> {
    try {
      const user = await this.userRepository.findOne({ where: { id: createOrderDto.userId } });
      if (!user) {
        throw new NotFound("User not found");
      }

      const products = await Promise.all(
        createOrderDto.productDetails.map(async ({ productId }) => {
          const product = await this.productRepository.findOne({ where: { id: productId } });
          if (!product) {
            throw new NotFound(`Product with id ${productId} not found`);
          }
          return product;
        })
      );

      const order = this.orderRepository.create({
        user,
        products,
        productDetails: createOrderDto.productDetails,
        totalAmount: createOrderDto.totalAmount
      });

      const savedOrder = await this.orderRepository.save(order);
      return {
        id: savedOrder.id,
        userId: savedOrder.user.id,
        productDetails: savedOrder.productDetails,
        totalAmount: savedOrder.totalAmount,
        orderDate: savedOrder.orderDate
      };
    } catch (error) {
      this.logger.error("OrderService: createOrder Error:", error);
      throw error instanceof NotFound ? error : new BadRequest("Error creating order");
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponse> {
    try {
      const order = await this.orderRepository.findOne({ where: { id }, relations: ["user"] });
      if (!order) {
        throw new NotFound("Order not found");
      }

      const updatedOrder = this.orderRepository.merge(order, {
        productDetails: updateOrderDto.productDetails,
        totalAmount: updateOrderDto.totalAmount
      });

      const savedOrder = await this.orderRepository.save(updatedOrder);
      return {
        id: savedOrder.id,
        userId: savedOrder.user.id,
        productDetails: savedOrder.productDetails,
        totalAmount: savedOrder.totalAmount,
        orderDate: savedOrder.orderDate
      };
    } catch (error) {
      this.logger.error("OrderService: update Error:", error);
      throw error instanceof NotFound ? error : new BadRequest("Error updating order");
    }
  }

  async remove(id: string): Promise<DeleteOrderResponse> {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        throw new NotFound("Order not found");
      }

      await this.orderRepository.delete(id);
      return { deleted: true, message: "Order deleted successfully" };
    } catch (error) {
      this.logger.error("OrderService: remove Error:", error);
      throw error instanceof NotFound ? error : new BadRequest("Error deleting order");
    }
  }
}
