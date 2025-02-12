import { Inject, Injectable } from "@tsed/di";
import { BadRequest, NotFound } from "@tsed/exceptions";
import { Logger } from "@tsed/logger";
import { MssqlDatasource } from "src/datasources/MssqlDatasource.js";
import { Order } from "src/entities/OrderEntity.js";
import { OrderProduct } from "src/entities/OrderProduct.js";
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
  private orderProductRepository!: Repository<OrderProduct>;

  async $onInit() {
    if (this.mysqlDataSource.isInitialized) {
      this.orderRepository = this.mysqlDataSource.getRepository(Order);
      this.userRepository = this.mysqlDataSource.getRepository(User);
      this.productRepository = this.mysqlDataSource.getRepository(Product);
      this.orderProductRepository = this.mysqlDataSource.getRepository(OrderProduct);
    } else {
      throw new Error("Datasource not connected");
    }
  }

  async getAll(): Promise<OrderResponse[]> {
    try {
      const orders = await this.orderRepository.find({
        relations: ["user", "products"]
      });
      var orderResponse: OrderResponse[] = [];
      await Promise.all(
        orders.map(async (order) => {
          const products = await this.orderProductRepository.find({ where: { orderId: order.id } });
          orderResponse.push({
            id: order.id,
            userId: order.user.id,
            products: products.map((product) => ({
              id: product.productId,
              name: order.products.find((p) => p.id === product.productId)?.name || "",
              amount: product.amount
            })),
            totalAmount: order.totalAmount,
            orderDate: order.orderDate
          });
        })
      );

      console.log("orderResponse", orderResponse);

      return orderResponse;
    } catch (error) {
      this.logger.error("OrderService: getAll Error:", error);
      throw new BadRequest("Error fetching orders");
    }
  }

  async getById(id: string): Promise<OrderResponse> {
    try {
      const order = await this.orderRepository.findOne({ where: { id }, relations: ["user", "products"] });
      if (!order) {
        throw new NotFound("Order not found");
      }
      const products = await this.orderProductRepository.find({ where: { orderId: order.id } });
      return {
        id: order.id,
        userId: order.user.id,
        products: products.map((product) => ({
          id: product.productId,
          name: order.products.find((p) => p.id === product.productId)?.name || "",
          amount: product.amount
        })),
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
        createOrderDto.products.map(async (productDto) => {
          const product = await this.productRepository.findOne({ where: { id: productDto.id } });
          if (!product) {
            throw new NotFound(`Product with id ${productDto.id} not found`);
          }
          if (product.stock < productDto.amount) {
            throw new BadRequest(`Insufficient stock for product ${product.name}`);
          }

          return { ...product, amount: productDto.amount };
        })
      );

      const totalAmount = products.reduce((sum, product) => sum + product.amount, 0);

      const order = this.orderRepository.create({
        user,
        totalAmount
      });
      const savedOrder = await this.orderRepository.save(order);

      await Promise.all(
        products.map(async (product) => {
          await this.orderProductRepository.insert({
            order: savedOrder,
            product,
            amount: product.amount
          });

          product.stock -= product.amount;
          await this.productRepository.save(product);
        })
      );

      return {
        id: savedOrder.id,
        userId: savedOrder.user.id,
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          amount: product.amount
        })),
        totalAmount: savedOrder.totalAmount,
        orderDate: savedOrder.orderDate
      };
    } catch (error) {
      this.logger.error("OrderService: createOrder Error:", error);
      throw error instanceof NotFound || error instanceof BadRequest ? error : new BadRequest("Error creating order");
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponse> {
    try {
      const order = await this.orderRepository.findOne({ where: { id }, relations: ["user", "products"] });
      if (!order) {
        throw new NotFound("Order not found");
      }

      const updatedProducts = await Promise.all(
        updateOrderDto.products.map(async (productDto) => {
          const product = await this.productRepository.findOne({ where: { id: productDto.id } });
          if (!product) {
            throw new NotFound(`Product with id ${productDto.id} not found`);
          }

          const existingProductInOrder = order.products.find((p) => p.id === product.id);
          const previousAmount = existingProductInOrder
            ? existingProductInOrder.orders.find((op: { order: { id: string } }) => op.order.id === order.id)?.amount || 0
            : 0;
          const stockAdjustment = productDto.amount - previousAmount;

          if (product.stock < stockAdjustment) {
            throw new BadRequest(`Not enough stock for product: ${product.name}`);
          }

          product.stock -= stockAdjustment;
          await this.productRepository.save(product);

          return { ...product, amount: productDto.amount };
        })
      );

      const totalAmount = updatedProducts.reduce((sum, product) => sum + product.amount, 0);

      const updatedOrder = this.orderRepository.merge(order, {
        products: updatedProducts,
        totalAmount
      });

      const savedOrder = await this.orderRepository.save(updatedOrder);

      return {
        id: savedOrder.id,
        userId: savedOrder.user.id,
        products: updatedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          amount: p.amount
        })),
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
