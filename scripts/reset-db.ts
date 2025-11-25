import { execSync } from "node:child_process";
import { waitForDatabase } from "./utils";

async function main() {
  console.log("🗑️  Resetting database...\n");

  console.log("1️⃣  Stopping containers and removing volumes...");
  execSync("docker-compose -f ./scripts/docker-compose.yml down -v", { stdio: "inherit" });

  console.log("\n2️⃣  Starting fresh database...");
  execSync("docker-compose -f ./scripts/docker-compose.yml up -d", { stdio: "inherit" });

  console.log("\n3️⃣  Waiting for database...");
  await waitForDatabase();

  console.log("\n4️⃣  Running migrations...");
  execSync("pnpm db:migrate", { stdio: "inherit" });

  console.log("\n5️⃣  Seeding database...");
  execSync("pnpm db:seed", { stdio: "inherit" });

  console.log("\n✅ Database reset complete!\n");
}

main().catch((error) => {
  console.error("❌ Reset failed:", error);
  process.exit(1);
});
