import alchemy from "alchemy";
import { TanStackStart, Worker } from "alchemy/cloudflare";
import { GitHubComment } from "alchemy/github";
import { Exec } from "alchemy/os";
import { CloudflareStateStore } from "alchemy/state";

import { config } from "dotenv";

config({ path: "./.env" });

const app = await alchemy("showly", {
  stateStore: (scope) => new CloudflareStateStore(scope),
});

// let hyperdrive: Awaited<ReturnType<typeof Hyperdrive>>;

// if (app.local) {
//   hyperdrive = await Hyperdrive("Hyperdrive", {
//     origin: process.env.LOCAL_DATABASE_URL as string,
//     caching: { disabled: true },
//   });

//   await Exec("DrizzleGenerate", {
//     cwd: "packages/db",
//     command: "bun run db:generate",
//     env: {
//       DATABASE_URL: process.env.LOCAL_DATABASE_URL as string,
//     },
//     memoize: {
//       patterns: ["drizzle.config.ts", "src/schema.ts"],
//     },
//   });

//   // Apply migrations to the local database
//   await Exec("DrizzleMigrate", {
//     cwd: "packages/db",
//     command:
//       process.platform === "win32"
//         ? `cmd /C "bun run db:migrate || if %ERRORLEVEL%==9 exit 0 else exit %ERRORLEVEL%"`
//         : `sh -c 'bun run db:migrate || ( [ $? -eq 9 ] && exit 0 ); exit $?'`,
//     env: {
//       DATABASE_URL: process.env.LOCAL_DATABASE_URL as string,
//     },
//     memoize: {
//       patterns: ["drizzle.config.ts", "drizzle/*.sql"],
//     },
//   });
// } else {
//   const database = await Database("database", {
//     name: "showly-database",
//     clusterSize: "PS_5",
//     region: {
//       slug: "us-west",
//     },

//     kind: "postgresql",
//   });

//   const role = await Role("Role", {
//     database,
//     branch: database.defaultBranch,
//     inheritedRoles: ["postgres"],
//   });

//   hyperdrive = await Hyperdrive("Hyperdrive", {
//     origin: role.connectionUrl,
//     caching: { disabled: true },
//   });

//   await Exec("DrizzleGenerate", {
//     cwd: "packages/db",
//     command: "bun run db:generate",
//     env: {
//       DATABASE_URL: role.connectionUrl,
//     },
//     memoize: {
//       patterns: ["drizzle.config.ts", "src/schema.ts"],
//     },
//   });

//   // Apply migrations to the database
//   await Exec("DrizzleMigrate", {
//     cwd: "packages/db",
//     command:
//       process.platform === "win32"
//         ? `cmd /C "bun run db:migrate || if %ERRORLEVEL%==9 exit 0 else exit %ERRORLEVEL%"`
//         : `sh -c 'bun run db:migrate || ( [ $? -eq 9 ] && exit 0 ); exit $?'`,
//     env: {
//       DATABASE_URL: role.connectionUrl,
//     },
//     memoize: {
//       patterns: ["drizzle.config.ts", "drizzle/*.sql"],
//     },
//   });
// }

export const api = await Worker("api", {
  cwd: "apps/api",
  entrypoint: "src/index.ts",
  compatibility: "node",
  domains: ["api.showly.co"],
  bindings: {
    // HYPERDRIVE: hyperdrive,
  },
  dev: {
    port: 3000,
  },
});

export const web = await TanStackStart("web", {
  cwd: "apps/web",
  domains: ["app.showly.co"],
  bindings: {
    API_URL: api.url as string,
    // HYPERDRIVE: hyperdrive,
  },
});

if (process.env.PULL_REQUEST) {
  await GitHubComment("preview-comment", {
    owner: "morganstovold",
    repository: "showly",
    issueNumber: Number(process.env.PULL_REQUEST),
    body: `## 🚀 Preview Deployed

Your changes have been deployed to a preview environment:

**🌐 Web URL:** ${web.url}
**🌐 API URL:** ${api.url}

Built from commit ${process.env.GITHUB_SHA?.slice(0, 7)}

+---
<sub>🤖 This comment updates automatically with each push.</sub>`,
  });
}

if (app.local) {
  Exec("DrizzleStudio", {
    cwd: "packages/db",
    command: "bun run db:studio",
    env: {
      DATABASE_URL: process.env.LOCAL_DATABASE_URL as string,
    },
  });
}

await app.finalize();
