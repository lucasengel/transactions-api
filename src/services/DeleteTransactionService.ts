import { DeleteResult, getRepository } from "typeorm";
import AppError from "../errors/AppError";
import Transaction from "../models/Transaction";

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<DeleteResult> {
    const transactionsRepository = getRepository(Transaction);

    const transactionExists = await transactionsRepository.findOne(id);

    if (!transactionExists) throw new AppError("Transaction not found");

    const deletion = await transactionsRepository.delete(id);

    return deletion;
  }
}

export default DeleteTransactionService;
