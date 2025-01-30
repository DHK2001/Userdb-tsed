import { User } from "src/entities/UserEntity.js";

import { loginResponseDto } from "./UserModels.js";

export class ResponseAPi {
  success: boolean;
  message: string;
  data: User | User[] | loginResponseDto | null;
  error: any;
}
// generics
