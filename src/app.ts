import express from "express";
import cors from "cors";
import classifyRouter from "./routes/classify";
import { errorHandler } from "./utils/errors";

const app = express();

app.use(cors());

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`, req.query);
  next();
});

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/classify", classifyRouter);

app.use(errorHandler);

export default app;
