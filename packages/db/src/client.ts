import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export const getDB = (binding: Hyperdrive) => {
  const db = postgres(binding.connectionString);
  return drizzle(db, { schema });
};
