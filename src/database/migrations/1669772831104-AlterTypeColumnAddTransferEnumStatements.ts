import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterTypeColumnAddTransferEnumStatements1669772831104 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn("statements", "type", new TableColumn({
      name: "type",
      type: "enum",
      enum: ["deposit", "withdraw", "transfer"]
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn("statements", "type", new TableColumn({
      name: "type",
      type: "enum",
      enum: ["deposit", "withdraw"]
    }))
  }

}
