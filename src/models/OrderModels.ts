import { Property, Required } from "@tsed/schema";

export class CreateOrderDto {
  @Required()
  userId: string;

  @Required()
  products: { productId: string; quantity: number }[];

  @Required()
  totalAmount: number;

  @Required()
  orderDate: Date;
}

export class UpdateOrderDto {
  userId?: string;

  products?: { productId: string; quantity: number }[];

  totalAmount?: number;

  orderDate?: Date;
}

export class OrderResponse {
  @Property()
  id: string;

  @Property()
  userId: string;

  @Property()
  products: { productId: string; quantity: number }[];

  @Property()
  totalAmount: number;

  @Property()
  orderDate: Date;
}
