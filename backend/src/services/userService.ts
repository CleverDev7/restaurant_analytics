import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { pool, query } from "../db/pool";

export async function findUserByEmail(email: string) {
  const res = await query(`SELECT * FROM "User" WHERE email = $1 LIMIT 1`, [email.toLowerCase()]);
  return res.rows[0] || null;
}

export async function createRestaurantWithAdmin(restaurantName: string, email: string, password: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const restaurantId = uuidv4();
    await client.query(`INSERT INTO "Restaurant" (id, name, timezone) VALUES ($1, $2, $3)`, [
      restaurantId,
      restaurantName,
      "America/New_York"
    ]);
    const userId = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    await client.query(
      `INSERT INTO "User" (id, email, password, role, "restaurantId") VALUES ($1, $2, $3, 'ADMIN', $4)`,
      [userId, email.toLowerCase(), hash, restaurantId]
    );
    await client.query("COMMIT");
    return { userId, restaurantId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function createUser(
  restaurantId: string,
  email: string,
  password: string,
  role: "ADMIN" | "MANAGER" | "STAFF"
) {
  const hash = await bcrypt.hash(password, 10);
  const userId = uuidv4();
  await query(
    `INSERT INTO "User" (id, email, password, role, "restaurantId") VALUES ($1, $2, $3, $4, $5)`,
    [userId, email.toLowerCase(), hash, role, restaurantId]
  );
  return userId;
}
