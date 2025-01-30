import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1738268499831 implements MigrationInterface {
    name = 'CreateUsersTable1738268499831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "D_User" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_c3fda85dfadc954a635d44d0a23" DEFAULT NEWSEQUENTIALID(), "firstName" nvarchar(100) NOT NULL, "lastName" nvarchar(100) NOT NULL, "email" nvarchar(255) NOT NULL, "password_bcrypt" nvarchar(255) NOT NULL, "creationDate" datetime2 NOT NULL CONSTRAINT "DF_bf316873be0b80fda94489a01e0" DEFAULT getdate(), CONSTRAINT "UQ_88ab410e086ea166e0591c6b7d0" UNIQUE ("email"), CONSTRAINT "PK_c3fda85dfadc954a635d44d0a23" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "D_User"`);
    }

}
