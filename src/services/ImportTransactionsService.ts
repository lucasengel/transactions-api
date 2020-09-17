import fs from "fs";
import path from "path";
import csvParse from "csv-parse";

import { getRepository, In } from "typeorm";
import uploadConfig from "../config/upload";
import Transaction from "../models/Transaction";
import Category from "../models/Category";

interface Request {
  filename: string;
}

interface csvTransaction {
  title: string;
  type: "income" | "outcome";
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, filename);

    const readStream = fs.createReadStream(filePath);

    const parser = csvParse({
      from_line: 2,
    });

    const parsedCSV = readStream.pipe(parser);

    const categories: string[] = [];
    const transactions: csvTransaction[] = [];

    parsedCSV.on("data", async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !value || !type) return;

      if (!categories.includes(category)) categories.push(category);

      transactions.push({
        title,
        type,
        value,
        category,
      });
    });

    // TODO: WTF?
    await new Promise(resolve => parsedCSV.on("end", resolve));

    /**
     * BULK ADD CATEGORIES
     */
    const categoriesRepository = getRepository(Category);
    const existingCategories = await categoriesRepository.find({
      where: { title: In(categories) },
    });
    const existingCategoriesTitles = existingCategories.map(
      ({ title }: Category) => title,
    );
    const addCategoryTitles = categories
      .filter(category => !existingCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({ title })),
    );
    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existingCategories];

    /**
     * BULK ADD TRANSACTIONS
     */
    const transactionRepository = getRepository(Transaction);
    const createdTransactions = transactionRepository.create(
      transactions.map(({ title, value, type, category }) => ({
        title,
        value,
        type,
        category: finalCategories.find(cat => cat.title === category),
      })),
    );
    await transactionRepository.save(createdTransactions);

    fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
