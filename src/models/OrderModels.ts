import { Property, Required } from "@tsed/schema";

export class CreateOrderDto {
  @Required()
  userId!: string;

  @Required()
  productDetails!: { productId: string; quantity: number }[];

  @Required()
  totalAmount!: number;
}

export class UpdateOrderDto {
  @Required()
  productDetails!: { productId: string; quantity: number }[];

  @Required()
  totalAmount!: number;
}

export class OrderResponse {
  @Property()
  id!: string;

  @Property()
  userId!: string;

  @Property()
  productDetails!: { productId: string; quantity: number }[];

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
