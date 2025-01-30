import { registerProvider } from "@tsed/di";
import { Logger } from "@tsed/logger";
import { DataSource } from "typeorm";

export const MssqlDatasource = Symbol.for("MssqlDatasource");
export type MssqlDatasource = DataSource;
export const mssqlDatasource = new DataSource({
  type: "mssql",
  entities: [],
  host: "localhost",
  username: "sa",
  password: "Admin12345",
  database: "tempdb"
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
