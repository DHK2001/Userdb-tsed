import { Email, MaxLength, MinLength, Required } from "@tsed/schema";
import { Property } from "@tsed/schema";

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

export class loginUserDto {
  @Required()
  @Email()
  email: string;

  @Required()
  password: string;
}

export class loginResponseDto {
  @Property()
  accessToken: string;

  @Property()
  message: string;
}

export class deleteUserResponse {
  @Property()
  deleteUser: boolean;

  @Property()
  message: string;
}
