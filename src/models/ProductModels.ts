import { MaxLength, MinLength, Property, Required } from "@tsed/schema";

export class CreateProductDto {
  @Required()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @Required()
  description: string;

  @Required()
  price: number;

  @Required()
  stock: number;
}

export class UpdateProductDto {
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  description?: string;
  price?: number;
  stock?: number;
}

export class ProductResponse {
  @Property()
  id: string;

  @Property()
  name: string;

  @Property()
  description: string;

  @Property()
  price: number;

  @Property()
  stock: number;
}
