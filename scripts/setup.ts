import { execSync } from "node:child_process";
import fs from "node:fs";
import { waitForDatabase } from "./utils";

const ENV_FILES = [{ source: "apps/web/.env.example", dest: "apps/web/.env" }];

function checkDocker() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    console.log("   ✅ Docker installed\n");
  } catch {
    console.log("   ❌ Docker not found. Please install Docker Desktop first.");
    process.exit(1);
  }
}

function checkENV() {
  const missing = ENV_FILES.filter((file) => !fs.existsSync(file.dest));

  if (missing.length > 0) {
    console.log("❌ Missing environment files:");

    for (const file of missing) {
      console.log(`   - ${file.dest}`);
    }

    console.log("\n💡 Run: pnpm setup");
    process.exit(1);
  }
}

async function checkDatabase() {
  try {
    const result = execSync(
      'docker ps --filter "name=showly_db" --format "{{.Status}}"',
      { encoding: "utf-8" }
    );

    if (!result.includes("Up")) {
      console.log("🔄 Starting database...");
      execSync("docker-compose -f ./scripts/docker-compose.yml up -d", { stdio: "inherit" });
      console.log("⏳ Waiting for database to be ready");
      await waitForDatabase();
    }
  } catch (_error) {
    console.log("🔄 Starting database...");
    execSync("docker-compose -f ./scripts/docker-compose.yml up -d", { stdio: "inherit" });
    console.log("⏳ Waiting for database to be ready");
    await waitForDatabase();
  }
}

async function main() {
  console.log("🔍 Checking development environment...");

  checkDocker();
  checkENV();
  await checkDatabase();

  console.log("✅ Environment ready!");
}

main().catch((error) => {
  console.error("❌ Setup check failed:", error);
  process.exit(1);
});
