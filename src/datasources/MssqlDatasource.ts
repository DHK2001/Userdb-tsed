import { registerProvider } from "@tsed/di";
import { Logger } from "@tsed/logger";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config();

export const MssqlDatasource = Symbol.for("MssqlDatasource");
export type MssqlDatasource = DataSource;
export const mssqlDatasource = new DataSource({
  type: "mssql",
  host: process.env.HOST_NAME,
  username: process.env.USER_NAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE_NAME,
  options: {
    encrypt: true
  },
  synchronize: false
});

registerProvider<DataSource>({
  provide: MssqlDatasource,
  type: "typeorm:datasource",
  deps: [Logger],
  async useAsyncFactory(logger: Logger) {
    await mssqlDatasource.initialize();

    logger.info("Connected with typeorm to database: Mssql");

    return mssqlDatasource;
  },
  hooks: {
    $onDestroy(dataSource) {
      return dataSource.isInitialized && dataSource.close();
    }
  }
});
