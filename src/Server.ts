import "@tsed/platform-log-request";
import "@tsed/platform-express";
import "@tsed/ajv";
import "@tsed/swagger";

import { join } from "node:path";

import { Configuration } from "@tsed/di";
import { application } from "@tsed/platform-http";
import cors from "cors";

import { isProduction } from "./config/envs/index.js";
import { config } from "./config/index.js";
import * as pages from "./controllers/pages/index.js";
import * as rest from "./controllers/rest/index.js";
import CustomMiddleware from "./middleware/CustomMiddleware.js";

@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8083,
  httpsPort: false, // CHANGE
  disableComponentsScan: true,
  ajv: {
    returnsCoercedValues: true
  },
  mount: {
    "/v1": [...Object.values(rest)],
    "/": [...Object.values(pages)]
  },
  swagger: [
    {
      path: "/doc",
      specVersion: "3.0.1"
    }
  ],
  middlewares: [
    "cookie-parser",
    "compression",
    "method-override",
    "json-parser",
    { use: "urlencoded-parser", options: { extended: true } }
  ],
  views: {
    root: join(process.cwd(), "../views"),
    extensions: {
      ejs: "ejs"
    }
  },
  exclude: ["**/*.spec.ts"],
  logger: {
    disableRoutesSummary: isProduction
  }
})
export class Server {
  protected app = application();

  $beforeRoutesInit() {
    this.app.use(
      cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true
      })
    );
    this.app.use(CustomMiddleware);
  }
}
