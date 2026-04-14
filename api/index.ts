import type { IncomingMessage, ServerResponse } from "http";
import { initSchema } from "../src/utils/db";
import app from "../src/app";

const ready = initSchema();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ready;
  return app(req, res);
}
