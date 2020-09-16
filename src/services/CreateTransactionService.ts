import { getCustomRepository, getRepository } from "typeorm";
import AppError from "../errors/AppError";
import Category from "../models/Category";

import Transaction from "../models/Transaction";
import TransactionsRepository from "../repositories/TransactionsRepository";

interface Request {
  title: string;
  value: number;
  type: "income" | "outcome";
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category: categoryName = "Uncategorized",
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (!title || !value) throw new AppError("Missing parameters");

    if (type !== "outcome" && type !== "income")
      throw new AppError("Invalid type");

    /**
     * Checks for category existence
     * IF YES => use existing
     * IF NO  => create and save new category
     */
    const existingCategory = await categoriesRepository.findOne({
      where: {
        title: categoryName,
      },
    });

    const category =
      existingCategory ||
      categoriesRepository.create({
        title: categoryName,
      });

    await categoriesRepository.save(category);

    /**
     * Check if balance is greater than outcome value
     * IF YES => create transaction
     * IF NO  => reject transaction
     */

    const { total } = await transactionsRepository.getBalance();

    if (type === "outcome" && total < value)
      throw new AppError("Insuficient funds");

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
