import { Email, Format, Groups, MaxLength, MinLength, Property, Required } from "@tsed/schema";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum RoleType {
  USER = "USER",
  ADMIN = "ADMIN"
}

@Entity({ name: "D_User" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  @Property()
  @Required()
  id!: string;

  @Column({ length: 100 })
  @MinLength(3)
  @MaxLength(100)
  @Required()
  firstName!: string;

  @Column({ length: 100 })
  @MinLength(3)
  @MaxLength(100)
  @Required()
  lastName!: string;

  @Column({ unique: true })
  @Required()
  @Email()
  email!: string;

  @CreateDateColumn()
  @Required()
  creationDate!: Date;
}
