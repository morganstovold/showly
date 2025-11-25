import { execSync } from "node:child_process";

export function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export async function waitForDatabase() {
  const maxAttempts = 30;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const result = execSync(
        "docker exec showly_db pg_isready -U showly_dev_user -d showly_dev",
        { encoding: "utf-8", stdio: "pipe" }
      );

      if (result.includes("accepting connections")) {
        return;
      }
    } catch (_error) {
      // Database not ready yet
    }

    attempts += 1;
    process.stdout.write(".");
    await sleep(1);
  }

  throw new Error("Database failed to become ready after 30 seconds");
}
