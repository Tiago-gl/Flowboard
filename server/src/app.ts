import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { prisma } from "./lib/prisma";
import { authRoutes } from "./routes/auth";
import { taskRoutes } from "./routes/tasks";
import { habitRoutes } from "./routes/habits";
import { goalRoutes } from "./routes/goals";
import { layoutRoutes } from "./routes/layout";
import { analyticsRoutes } from "./routes/analytics";

export const buildApp = () => {
  const app = Fastify({ logger: true });

  const JWT_SECRET = process.env.JWT_SECRET ?? "change-me";
  const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";
  const allowedOrigins = CORS_ORIGIN.split(",").map((origin) => origin.trim());

  app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  });

  app.register(jwt, {
    secret: JWT_SECRET,
  });

  app.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      reply.code(401).send({ message: "Nao autorizado." });
    }
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.register(authRoutes);
  app.register(taskRoutes);
  app.register(habitRoutes);
  app.register(goalRoutes);
  app.register(layoutRoutes);
  app.register(analyticsRoutes);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
};
