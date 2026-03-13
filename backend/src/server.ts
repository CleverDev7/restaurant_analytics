import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { router as analyticsRouter } from "./routes/analytics";

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/analytics", analyticsRouter);

  app.use((req, res) => {
    res.status(404).json({ message: "Not Found", path: req.path });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  });

  return app;
}

export function startServer() {
  const app = createServer();
  app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
}
