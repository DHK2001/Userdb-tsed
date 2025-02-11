import { Constant } from "@tsed/di";
import { NotAcceptable, Unauthorized } from "@tsed/exceptions";
import { Middleware, MiddlewareMethods } from "@tsed/platform-middlewares";
import { Context } from "@tsed/platform-params";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

@Middleware()
export default class CustomMiddleware implements MiddlewareMethods {
  @Constant("acceptMimes")
  acceptMimes: string[];

  use(@Context() $ctx: Context) {
    if (!$ctx.request.accepts(this.acceptMimes)) {
      throw new NotAcceptable("Accepted mimes are: " + this.acceptMimes.join(", "));
    }

    const method = $ctx.request.method.toUpperCase();
    const path = $ctx.request.url;

    if (["GET", "PUT", "DELETE"].includes(method) && path.startsWith("/v1/users")) {
      this.verifyAccessToken($ctx);
    } else if (path.startsWith("/v1/products") || path.startsWith("/v1/orders")) {
      this.verifyAccessToken($ctx);
    }
  }

  verifyAccessToken(ctx: Context) {
    try {
      const token = Array.isArray(ctx.request.headers["authorization-token"])
        ? ctx.request.headers["authorization-token"][0]
        : ctx.request.headers["authorization-token"];
      const secretKey = process.env.SECRET_KEY as string;

      if (!token) {
        throw new Unauthorized("Authorization token is missing");
      }

      jwt.verify(token, secretKey);
    } catch (err) {
      throw new Unauthorized(err);
    }
  }
}
