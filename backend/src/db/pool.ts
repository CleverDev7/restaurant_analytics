import { Pool, QueryResult } from "pg";
import { env } from "../config/env";

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10
});

// Helper to run a query (loosely typed)
export async function query(text: string, params: any[] = []): Promise<QueryResult<any>> {
  return pool.query(text, params);
}
