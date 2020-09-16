import { getRepository } from "typeorm";
import AppError from "../errors/AppError";
import Transaction from "../models/Transaction";

interface Request {
  id: string;
}

interface Response {
  message: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<Response> {
    const transactionsRepository = getRepository(Transaction);

    const transactionExists = await transactionsRepository.findOne(id);

    if (!transactionExists) throw new AppError("Transaction not found");

    await transactionsRepository.delete(id);

    return { message: `Transaction deleted successfully` };
  }
}

export default DeleteTransactionService;
