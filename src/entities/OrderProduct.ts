import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { Order } from "./OrderEntity.js";
import { Product } from "./ProductEntity.js";

@Entity({ name: "d_order_products_d_product" })
export class OrderProduct {
  @PrimaryColumn("uniqueidentifier", { name: "dOrderId" })
  orderId!: string;

  @PrimaryColumn("uniqueidentifier", { name: "dProductId" })
  productId!: string;

  @ManyToOne(() => Order, (order) => order.products)
  @JoinColumn({ name: "dOrderId" })
  order!: Order;

  @ManyToOne(() => Product, (product) => product.orders)
  @JoinColumn({ name: "dProductId" })
  product!: Product;

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;
}
