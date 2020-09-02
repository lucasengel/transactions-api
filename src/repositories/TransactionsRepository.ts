import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

class TransactionsRepository {
  private transactions: Transaction[];

  private balance: Balance;

  constructor() {
    this.transactions = [];
    this.balance = { income: 0, outcome: 0, total: 0 };
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getBalance(): Balance {
    const { income, outcome, total } = this.transactions.reduce(
      (balance: Balance, transaction: Transaction) => {
        const innerBalance = balance;

        if (transaction.type === 'income') {
          innerBalance.income += transaction.value;
        } else if (transaction.type === 'outcome') {
          innerBalance.outcome += transaction.value;
        }

        innerBalance.total = innerBalance.income - innerBalance.outcome;

        return innerBalance;
      },
      { income: 0, outcome: 0, total: 0 },
    );

    return {
      income,
      outcome,
      total,
    };
  }

  public create({ title, value, type }: CreateTransactionDTO): Transaction {
    const transaction = new Transaction({ title, value, type });

    this.transactions.push(transaction);

    return transaction;
  }
}

export default TransactionsRepository;
