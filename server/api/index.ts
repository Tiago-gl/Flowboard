import "dotenv/config";
import type { IncomingMessage, ServerResponse } from "http";
import { buildApp } from "../src/app";

const app = buildApp();
let isReady = false;

const ensureReady = async () => {
  if (!isReady) {
    await app.ready();
    isReady = true;
  }
};

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  await ensureReady();
  app.server.emit("request", req, res);
}
