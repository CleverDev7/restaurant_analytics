import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { createRestaurantWithAdmin, createUser, findUserByEmail } from "../services/userService";
import { AuthUser } from "../types/auth";

export async function signup(req: Request, res: Response) {
  const { restaurantName, email, password } = req.body || {};
  if (!restaurantName || !email || !password) {
    return res.status(400).json({ message: "restaurantName, email, password are required" });
  }
  const existing = await findUserByEmail(email);
  if (existing) return res.status(400).json({ message: "User already exists" });
  const { userId, restaurantId } = await createRestaurantWithAdmin(restaurantName, email, password);
  const token = jwt.sign(
    { id: userId, restaurantId, role: "ADMIN", email } as AuthUser,
    env.jwtSecret,
    { expiresIn: "7d" }
  );
  res.status(201).json({ token });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "email and password required" });
  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const payload: AuthUser = {
    id: user.id,
    restaurantId: user.restaurantId,
    role: user.role,
    email: user.email
  };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
  res.json({ token });
}

export async function invite(req: Request, res: Response) {
  const { email, password, role } = req.body || {};
  if (!email || !password || !role) return res.status(400).json({ message: "email, password, role required" });
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "ADMIN" && req.user.role !== "MANAGER") {
    return res.status(403).json({ message: "Forbidden" });
  }
  await createUser(req.user.restaurantId, email, password, role);
  res.status(201).json({ message: "User created" });
}
