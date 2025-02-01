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

    const method = $ctx.request.method.toUpperCase();
    if (["GET", "PUT", "DELETE"].includes(method)) {
      this.verifyAccessToken($ctx);
    }
  }

  verifyAccessToken(ctx: Context) {
    const token = ctx.request.headers["authorization-token"];
    if (token) {
      console.log(`Authorization Token: ${token}`);
    } else {
      console.warn("No Authorization Token provided");
    }
  }
}
