import alchemy from "alchemy";
import { TanStackStart, Worker } from "alchemy/cloudflare";
import { GitHubComment } from "alchemy/github";
import { CloudflareStateStore } from "alchemy/state";

import { config } from "dotenv";

config({ path: "./.env" });

const app = await alchemy("showly", {
  stateStore: (scope) => new CloudflareStateStore(scope),
});

export const web = await TanStackStart("web", {
  cwd: "apps/web",
});

export const server = await Worker("server", {
  cwd: "apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  dev: {
    port: 3000,
  },
});

if (process.env.PULL_REQUEST) {
  await GitHubComment("preview-comment", {
    owner: "morgannstovold",
    repository: "showly",
    issueNumber: Number(process.env.PULL_REQUEST),
    body: `## 🚀 Preview Deployed

Your changes have been deployed to a preview environment:

**🌐 Application URL:** ${web.url}
**🌐 API URL:** ${server.url}

Built from commit ${process.env.GITHUB_SHA?.slice(0, 7)}

+---
<sub>🤖 This comment updates automatically with each push.</sub>`,
  });
}

await app.finalize();
