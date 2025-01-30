import { User } from "src/entities/UserEntity.js";

export class ResponseAPi {
  success: boolean;
  message: string;
  data: User | User[] | boolean | null;
  error: any;
}
