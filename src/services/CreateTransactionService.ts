import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  private transactionsRepository: TransactionsRepository;

  constructor(transactionsRepository: TransactionsRepository) {
    this.transactionsRepository = transactionsRepository;
  }

  public execute({ title, value, type }: Request): Transaction {
    if (!title || !value || !['income', 'outcome'].includes(type))
      throw new Error(`Invalid or missing parameters.`);

    const balance = this.transactionsRepository.getBalance().total;
    if (type === 'outcome' && value > balance)
      throw new Error(`You don't have enough balance for this operation.`);

    const transaction = this.transactionsRepository.create({
      title,
      value,
      type,
    });

    return transaction;
  }
}

export default CreateTransactionService;
