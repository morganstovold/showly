import alchemy from "alchemy";
import { TanStackStart, Worker } from "alchemy/cloudflare";
import { GitHubComment } from "alchemy/github";
import { CloudflareStateStore } from "alchemy/state";

import { config } from "dotenv";

config({ path: "./.env" });

const app = await alchemy("showly", {
  stateStore: (scope) => new CloudflareStateStore(scope),
});

export const api = await Worker("api", {
  cwd: "apps/api",
  entrypoint: "src/index.ts",
  compatibility: "node",
  domains: ["api.showly.co"],
  dev: {
    port: 3000,
  },
});

export const web = await TanStackStart("web", {
  cwd: "apps/web",
  domains: ["showly.co"],
  bindings: {
    API_URL: api.url as string,
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

await app.finalize();
