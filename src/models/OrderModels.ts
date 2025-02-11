import { Property, Required } from "@tsed/schema";
import { Product } from "src/entities/ProductEntity.js";

export class CreateOrderDto {
  @Required()
  userId!: string;

  @Required()
  products!: String[];

  @Required()
  totalAmount!: number;
}

export class UpdateOrderDto {
  @Required()
  products!: String[];

  @Required()
  totalAmount!: number;
}

export class OrderResponse {
  @Property()
  id!: string;

  @Property()
  userId!: string;

  @Property()
  products!: Product[];

  @Property()
  totalAmount!: number;

  @Property()
  orderDate!: Date;
}

export class DeleteOrderResponse {
  @Property()
  deleted!: boolean;

  @Property()
  message!: string;
}
