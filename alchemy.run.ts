import alchemy from "alchemy";
import { TanStackStart } from "alchemy/cloudflare";
import { Worker } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "./apps/web/.env" });
config({ path: "./apps/server/.env" });

const app = await alchemy("showly");

export const web = await TanStackStart("web", {
	cwd: "apps/web",
	bindings: {
		VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL,
		CORS_ORIGIN: alchemy.env.CORS_ORIGIN,
	},
});

export const server = await Worker("server", {
	cwd: "apps/server",
	entrypoint: "src/index.ts",
	compatibility: "node",
	bindings: {
		CORS_ORIGIN: alchemy.env.CORS_ORIGIN,
	},
	dev: {
		port: 3000,
	},
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
