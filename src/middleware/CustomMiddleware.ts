import { Constant } from "@tsed/di";
import { NotAcceptable } from "@tsed/exceptions";
import { Middleware, MiddlewareMethods } from "@tsed/platform-middlewares";
import { Context } from "@tsed/platform-params";

@Middleware()
export default class CustomMiddleware implements MiddlewareMethods {
  @Constant("acceptMimes")
  acceptMimes: string[];

  use(@Context() $ctx: Context) {
    if (!$ctx.request.accepts(this.acceptMimes)) {
      throw new NotAcceptable("Accepted mimes are: " + this.acceptMimes.join(", "));
    }

    this.verifyAccessToken($ctx);
  }

  verifyAccessToken(ctx: Context) {
    console.log("verifyAccessToken");
    return;
    const token = ctx.request.headers.authorization;

    if (!token) {
      throw new Error("Access token is missing");
    }
    console.log(`Token provided: ${token}`);
  }
}
