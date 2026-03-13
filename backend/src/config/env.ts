import dotenv from "dotenv";

// Load env first
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  databaseUrl: process.env.DATABASE_URL || "",
  nodeEnv: process.env.NODE_ENV || "development"
};

if (!env.databaseUrl) {
  // Log a soft warning to avoid runtime crash in dev scaffolding
  console.warn("DATABASE_URL is not set. Please configure backend/.env");
}