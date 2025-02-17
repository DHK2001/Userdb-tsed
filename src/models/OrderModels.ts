import { Property, Required } from "@tsed/schema";

export class CreateOrderDto {
  @Required()
  userId!: string;

  @Required()
  products!: { id: string; amount: number }[];
}

export class UpdateOrderDto {
  @Required()
  products!: { id: string; amount: number }[];
}

export class OrderResponse {
  @Property()
  id!: string;

  @Property()
  userId!: string;

  @Property()
  products!: { id: string; name: string; amount: number }[];

  @Property()
  totalAmount!: number;

  @Property()
  orderDate!: Date;

  @Property()
  finalized!: boolean;
}

export class DeleteOrderResponse {
  @Property()
  deleted!: boolean;

  @Property()
  message!: string;
}

export class FinalizedOrderResponse {
  @Property()
  finilized!: boolean;

  @Property()
  message!: string;
}
