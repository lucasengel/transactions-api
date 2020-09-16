import { EntityRepository, Repository } from "typeorm";

import Transaction from "../models/Transaction";

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const { incomeRaw } = await this.createQueryBuilder("transaction")
      .select("SUM(transaction.value)", "incomeRaw")
      .where({ type: "income" })
      .getRawOne();

    const { outcomeRaw } = await this.createQueryBuilder("transaction")
      .select("SUM(transaction.value)", "outcomeRaw")
      .where({ type: "outcome" })
      .getRawOne();

    const income = Number(incomeRaw);
    const outcome = Number(outcomeRaw);

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
