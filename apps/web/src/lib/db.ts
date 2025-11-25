import { Pool, PrismaClient, PrismaPg } from "@showly/db";
import { attachDatabasePool } from "@vercel/functions";
import { env } from "@/env";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

attachDatabasePool(pool);

const adapter = new PrismaPg(pool);

export const db = new PrismaClient({
  adapter,
});
