export const getResourceDomain = (
	resource: "api" | "app" | "showly",
	stage?: string
) => {
	const currentStage = stage ?? process.env.STAGE ?? "dev";

	if (currentStage === "prod") {
		const subdomain = resource === "showly" ? "" : `${resource}.`;
		return `https://${subdomain}showly.co`;
	}

	if (currentStage.startsWith("pr-")) {
		const subdomain = resource === "showly" ? "" : `${resource}.`;
		return `https://${currentStage}.${subdomain}showly.co`;
	}

	const ports = { api: 3002, app: 3001, showly: 3000 };
	return `http://localhost:${ports[resource]}`;
};
