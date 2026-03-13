// Ensure environment defaults (DATABASE_URL) are loaded before Prisma initializes

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
