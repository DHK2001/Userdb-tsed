import { Inject, Injectable } from "@tsed/di";
import { BadRequest, NotFound } from "@tsed/exceptions";
import { Logger } from "@tsed/logger";
import { MssqlDatasource } from "src/datasources/MssqlDatasource.js";
import { Order } from "src/entities/OrderEntity.js";
import { OrderProduct } from "src/entities/OrderProduct.js";
import { Product } from "src/entities/ProductEntity.js";
import { User } from "src/entities/UserEntity.js";
import { CreateOrderDto, DeleteOrderResponse, FinalizedOrderResponse, OrderResponse, UpdateOrderDto } from "src/models/OrderModels.js";
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
      console.log("ord3ers", orders);
      await Promise.all(
        orders.map(async (order) => {
          const products = await this.orderProductRepository.find({ where: { orderId: order.id } });
          orderResponse.push({
            id: order.id,
            userId: order.user === null ? "User Deleted" : order.user.id,
            products: products.map((product) => ({
              id: product.productId,
              name: order.products.find((p) => p.id === product.productId)?.name || "",
              amount: product.amount
            })),
            totalAmount: order.totalAmount,
            orderDate: order.orderDate,
            finalized: order.finalized
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

  async getByUserId(userId: string, finalized?: boolean): Promise<OrderResponse[]> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFound("User not found");
      }

      const whereConditions: any = { user: { id: userId } };
      if (finalized !== undefined) {
        whereConditions.finalized = finalized;
      }

      const orders = await this.orderRepository.find({
        where: whereConditions,
        relations: ["user", "products"]
      });

      const orderResponse: OrderResponse[] = await Promise.all(
        orders.map(async (order) => {
          const products = await this.orderProductRepository.find({
            where: { orderId: order.id }
          });
          return {
            id: order.id,
            userId: order.user.id,
            products: products.map((product) => ({
              id: product.productId,
              name: order.products.find((p) => p.id === product.productId)?.name || "",
              amount: product.amount
            })),
            totalAmount: order.totalAmount,
            orderDate: order.orderDate,
            finalized: order.finalized
          };
        })
      );
      return orderResponse;
    } catch (error) {
      this.logger.error("OrderService: getByUserId Error:", error);
      throw error instanceof NotFound ? error : new BadRequest("Error fetching orders");
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
        userId: order.user === null ? "User Deleted" : order.user.id,
        products: products.map((product) => ({
          id: product.productId,
          name: order.products.find((p) => p.id === product.productId)?.name || "",
          amount: product.amount
        })),
        totalAmount: order.totalAmount,
        orderDate: order.orderDate,
        finalized: order.finalized
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
        orderDate: savedOrder.orderDate,
        finalized: savedOrder.finalized
      };
    } catch (error) {
      this.logger.error("OrderService: createOrder Error:", error);
      throw error instanceof NotFound || error instanceof BadRequest ? error : new BadRequest("Error creating order");
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponse> {
    try {
      const existingOrder = await this.orderRepository.findOne({
        where: { id },
        relations: ["user", "products"]
      });

      if (!existingOrder) {
        throw new NotFound("Order not found");
      }

      if (existingOrder.finalized) {
        throw new BadRequest("Order already finalized");
      }

      const existingOrderProducts = await this.orderProductRepository.find({ where: { orderId: existingOrder.id } });
      const updateProductMap = new Map(updateOrderDto.products.map((p) => [p.id, p.amount]));

      for (const orderProduct of existingOrderProducts) {
        const newAmount = updateProductMap.get(orderProduct.productId);

        if (newAmount === undefined) {
          const product = await this.productRepository.findOne({ where: { id: orderProduct.productId } });
          if (product) {
            product.stock += orderProduct.amount;
            await this.productRepository.save(product);
          }
          await this.orderProductRepository.delete(orderProduct);
        } else {
          const amountDiff = newAmount - orderProduct.amount;
          const product = await this.productRepository.findOne({ where: { id: orderProduct.productId } });
          if (product) {
            product.stock -= amountDiff;
            if (product.stock < 0) {
              throw new BadRequest(`Insufficient stock for product ${product.name}`);
            }
            await this.productRepository.save(product);
          }
          orderProduct.amount = newAmount;
          await this.orderProductRepository.save(orderProduct);
          updateProductMap.delete(orderProduct.productId);
        }
      }

      for (const [productId, amount] of updateProductMap.entries()) {
        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (!product) {
          throw new NotFound(`Product with id ${productId} not found`);
        }
        if (product.stock < amount) {
          throw new BadRequest(`Insufficient stock for product ${product.name}`);
        }

        product.stock -= amount;
        await this.productRepository.save(product);

        await this.orderProductRepository.insert({
          order: existingOrder,
          product,
          amount
        });
      }

      const updatedOrderProducts = await this.orderProductRepository.find({ where: { orderId: existingOrder.id } });
      const totalAmount = updatedOrderProducts.reduce((sum, op) => {
        const product = existingOrder.products.find((p) => p.id === op.productId);
        return sum + op.amount;
      }, 0);

      existingOrder.totalAmount = totalAmount;
      await this.orderRepository.save(existingOrder);

      return {
        id: existingOrder.id,
        userId: existingOrder.user.id,
        products: updatedOrderProducts.map((op) => ({
          id: op.productId,
          name: existingOrder.products.find((p) => p.id === op.productId)?.name || "",
          amount: op.amount
        })),
        totalAmount: existingOrder.totalAmount,
        orderDate: existingOrder.orderDate,
        finalized: existingOrder.finalized
      };
    } catch (error) {
      this.logger.error("OrderService: update Error:", error);
      throw error instanceof NotFound || error instanceof BadRequest ? error : new BadRequest("Error updating order");
    }
  }

  async remove(id: string): Promise<DeleteOrderResponse> {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        throw new NotFound("Order not found");
      }
      await this.orderRepository.delete(id);
      await this.orderProductRepository.delete({ orderId: id });
      return { deleted: true, message: "Order deleted successfully" };
    } catch (error) {
      this.logger.error("OrderService: remove Error:", error);
      throw error instanceof NotFound ? error : new BadRequest("Error deleting order");
    }
  }

  async finalize(id: string): Promise<FinalizedOrderResponse> {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        throw new NotFound("Order not found");
      }

      if (order.finalized) {
        throw new BadRequest("Order already finalized");
      }

      order.finalized = true;
      await this.orderRepository.save(order);
      return { finilized: true, message: "Order finalized successfully" };
    } catch (error) {
      this.logger.error("OrderService: finalize Error:", error);
      throw error instanceof NotFound ? error : new BadRequest("Error finalizing order");
    }
  }
}
