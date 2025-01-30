import { Email, MaxLength, MinLength, Required } from "@tsed/schema";

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

  @Required()
  password: string;
}

export class UpdateUserDto {
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
