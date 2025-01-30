import { Constant } from "@tsed/di";
import { NotAcceptable } from "@tsed/exceptions";
import { Middleware, MiddlewareMethods } from "@tsed/platform-middlewares";
import { Context } from "@tsed/platform-params";

@Middleware()
export default class CustomMiddleware implements MiddlewareMethods {
  @Constant("acceptMimes")
  acceptMimes: string[];

  use(@Context() $ctx: Context) {
    console.log("AcceptMimesMiddleware: ", $ctx.request.accepts(this.acceptMimes));
    if (!$ctx.request.accepts(this.acceptMimes)) {
      throw new NotAcceptable("Accepted mimes are: " + this.acceptMimes.join(", "));
    }
  }
}
