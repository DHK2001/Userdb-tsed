import { MaxLength, MinLength, Property, Required } from "@tsed/schema";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "D_Product" })
export class Product {
  @PrimaryGeneratedColumn("uuid")
  @Property()
  @Required()
  id!: string;

  @Column({ length: 100 })
  @MinLength(3)
  @MaxLength(100)
  @Required()
  name!: string;

  @Column("text")
  @Required()
  description!: string;

  @Column("text")
  @Required()
  imageUrl!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  @Required()
  price!: number;

  @Column("int")
  @Required()
  stock!: number;
  orders: any;
}
