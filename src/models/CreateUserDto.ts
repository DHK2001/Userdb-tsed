import { Email, MaxLength, MinLength, Required } from "@tsed/schema";
import { RoleType } from "src/entities/UserEntity.js";

export class CreateUserDto {
  @Required()
  @MinLength(3)
  @MaxLength(100)
  firstName: string;

  @Required()
  @MinLength(3)
  @MaxLength(100)
  lastName: string;

  @Required()
  @Email()
  email: string;
}
