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
    type = "outcome",
    category: categoryName = "Uncategorized",
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (!title || !value) throw new AppError("Missing parameters");

    // Check for existing category
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
