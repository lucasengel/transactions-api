import "dotenv/config";
import "express-async-errors";
import "reflect-metadata";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";

import AppError from "./errors/AppError";
import createConnection from "./database";
import routes from "./routes";

createConnection();
const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  console.error(err);

  return response.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

export default app;
