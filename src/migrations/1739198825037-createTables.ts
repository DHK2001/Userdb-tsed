import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1739198825037 implements MigrationInterface {
  name = "CreateTables1739198825037";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='D_Product' AND xtype='U')
      CREATE TABLE "D_Product" (
        "id" uniqueidentifier NOT NULL CONSTRAINT "DF_e1b37c88b3bffe37fc6efcdaa7e" DEFAULT NEWSEQUENTIALID(),
        "name" nvarchar(100) NOT NULL,
        "description" text NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "stock" int NOT NULL,
        CONSTRAINT "PK_e1b37c88b3bffe37fc6efcdaa7e" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='D_User' AND xtype='U')
      CREATE TABLE "D_User" (
        "id" uniqueidentifier NOT NULL CONSTRAINT "DF_c3fda85dfadc954a635d44d0a23" DEFAULT NEWSEQUENTIALID(),
        "firstName" nvarchar(100) NOT NULL,
        "lastName" nvarchar(100) NOT NULL,
        "email" nvarchar(255) NOT NULL,
        "password_bcrypt" nvarchar(255) NOT NULL,
        "creationDate" datetime2 NOT NULL CONSTRAINT "DF_bf316873be0b80fda94489a01e0" DEFAULT getdate(),
        CONSTRAINT "UQ_88ab410e086ea166e0591c6b7d0" UNIQUE ("email"),
        CONSTRAINT "PK_c3fda85dfadc954a635d44d0a23" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='D_Order' AND xtype='U')
      CREATE TABLE "D_Order" (
        "id" uniqueidentifier NOT NULL CONSTRAINT "DF_e3355675d6ba92124ea2f4f7fc8" DEFAULT NEWSEQUENTIALID(),
        "productDetails" nvarchar(max) NOT NULL,
        "totalAmount" decimal(10,2) NOT NULL,
        "orderDate" datetime2 NOT NULL CONSTRAINT "DF_4028292ac790292568133d908ff" DEFAULT getdate(),
        "userId" uniqueidentifier,
        CONSTRAINT "PK_e3355675d6ba92124ea2f4f7fc8" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='d_order_products_d_product' AND xtype='U')
      CREATE TABLE "d_order_products_d_product" (
        "dOrderId" uniqueidentifier NOT NULL,
        "dProductId" uniqueidentifier NOT NULL,
        CONSTRAINT "PK_11d12b19aa5254037d6b967fc65" PRIMARY KEY ("dOrderId", "dProductId")
      )
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysindexes WHERE name='IDX_f41bb838a9730d33684ada8b2a')
      CREATE INDEX "IDX_f41bb838a9730d33684ada8b2a" ON "d_order_products_d_product" ("dOrderId")
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sysindexes WHERE name='IDX_e36d1e1e51241ecf23cc810c37')
      CREATE INDEX "IDX_e36d1e1e51241ecf23cc810c37" ON "d_order_products_d_product" ("dProductId")
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name='FK_73eabf4aee7e9ca17dd0a911bf3')
      ALTER TABLE "D_Order" ADD CONSTRAINT "FK_73eabf4aee7e9ca17dd0a911bf3" FOREIGN KEY ("userId") REFERENCES "D_User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name='FK_f41bb838a9730d33684ada8b2a2')
      ALTER TABLE "d_order_products_d_product" ADD CONSTRAINT "FK_f41bb838a9730d33684ada8b2a2" FOREIGN KEY ("dOrderId") REFERENCES "D_Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name='FK_e36d1e1e51241ecf23cc810c372')
      ALTER TABLE "d_order_products_d_product" ADD CONSTRAINT "FK_e36d1e1e51241ecf23cc810c372" FOREIGN KEY ("dProductId") REFERENCES "D_Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "d_order_products_d_product" DROP CONSTRAINT "FK_e36d1e1e51241ecf23cc810c372"`);
    await queryRunner.query(`ALTER TABLE "d_order_products_d_product" DROP CONSTRAINT "FK_f41bb838a9730d33684ada8b2a2"`);
    await queryRunner.query(`ALTER TABLE "D_Order" DROP CONSTRAINT "FK_73eabf4aee7e9ca17dd0a911bf3"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_e36d1e1e51241ecf23cc810c37"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_f41bb838a9730d33684ada8b2a"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "d_order_products_d_product"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "D_Order"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "D_User"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "D_Product"`);
  }
}
