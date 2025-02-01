import { Property } from "@tsed/schema";
import { User } from "src/entities/UserEntity.js";

import { loginResponseDto } from "./UserModels.js";

export class ResponseAPi {
  @Property()
  success: boolean;

  @Property()
  message: string;

  @Property()
  data: User | User[] | loginResponseDto | null;

  @Property()
  error: any;
}
