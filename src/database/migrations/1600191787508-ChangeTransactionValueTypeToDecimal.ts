import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export default class ChangeTransactionValueTypeToDecimal1600191787508
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "transactions",
      "value",
      new TableColumn({
        name: "value",
        type: "decimal",
        scale: 2,
        precision: 10,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "transactions",
      "value",
      new TableColumn({
        name: "value",
        type: "integer",
      }),
    );
  }
}
