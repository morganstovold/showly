import { getResourceDomain } from "@showly/config/getDomain";
import alchemy, { type Secret } from "alchemy";
import {
	Hyperdrive,
	KVNamespace,
	TanStackStart,
	Worker,
} from "alchemy/cloudflare";
import { GitHubComment } from "alchemy/github";
import { Exec } from "alchemy/os";
import { Branch, Database, Role } from "alchemy/planetscale";
import { CloudflareStateStore } from "alchemy/state";
import { config } from "dotenv";

config({ path: "./.env" });

const app = await alchemy("showly", {
	stateStore: (scope) => new CloudflareStateStore(scope),
});

const apiDomain = getResourceDomain("api", app.stage);
const webDomain = getResourceDomain("app", app.stage);

const getDomainsArray = (domain: string) => {
	if (app.stage === "dev" || !app.stage) {
		return [];
	}
	const url = new URL(domain);
	return [url.hostname];
};

let databaseUrl: Secret<string>;

if (app.stage === "prod" || app.stage.startsWith("pr-")) {
	const database = await Database("Database", {
		name: "showly-prod",
		clusterSize: "PS_DEV",
		region: {
			slug: "us-west",
		},
		kind: "postgresql",
		adopt: true,
	});

	if (app.stage === "prod") {
		const role = await Role("Role", {
			database,
			branch: database.defaultBranch,
			inheritedRoles: ["postgres"],
			delete: true,
		});

		databaseUrl = role.connectionUrl;
	} else {
		const branch = await Branch(`showly-${app.stage}`, {
			name: `showly-${app.stage}`,
			database,
			isProduction: false,
			parentBranch: database.defaultBranch,
			delete: true,
			adopt: true,
		});

		const role = await Role("Role", {
			database,
			branch,
			inheritedRoles: ["postgres"],
			delete: true,
		});

		databaseUrl = role.connectionUrl;
	}
} else {
	databaseUrl = alchemy.secret(process.env.DATABASE_URL as string);
}

const hyperdrive = await Hyperdrive("Hyperdrive", {
	adopt: true,
	name: "showly-hyperdrive",
	origin: databaseUrl,
});

await Exec("DrizzleGenerate", {
	cwd: "packages/db",
	command: "bun run db:generate",
	env: {
		DATABASE_URL: databaseUrl,
	},
	memoize: {
		patterns: ["drizzle.config.ts", "src/schema.ts"],
	},
});

// Apply migrations to the database
await Exec("DrizzleMigrate", {
	cwd: "packages/db",
	command:
		process.platform === "win32"
			? `cmd /C "bun run db:migrate || if %ERRORLEVEL%==9 exit 0 else exit %ERRORLEVEL%"`
			: `sh -c 'bun run db:migrate || ( [ $? -eq 9 ] && exit 0 ); exit $?'`,
	env: {
		DATABASE_URL: databaseUrl,
	},
	memoize: {
		patterns: ["drizzle.config.ts", "drizzle/*.sql"],
	},
});

const kv = await KVNamespace("showly-kv", {
	title: "showly-kv",
	adopt: true,
});

export const api = await Worker("Api", {
	cwd: "apps/api",
	adopt: true,
	entrypoint: "src/index.ts",
	compatibility: "node",
	domains: getDomainsArray(apiDomain),
	bindings: {
		HYPERDRIVE: hyperdrive,
		KV: kv,
		WEB_URL: webDomain,
		API_URL: apiDomain,
	},
	dev: {
		port: 3002,
	},
});

export const web = await TanStackStart("Web", {
	cwd: "apps/web",
	adopt: true,
	domains: getDomainsArray(webDomain),
	bindings: {
		HYPERDRIVE: hyperdrive,
		KV: kv,
		API_URL: apiDomain,
		WEB_URL: webDomain,
	},
});

if (process.env.PULL_REQUEST) {
	await GitHubComment("PreviewComment", {
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
