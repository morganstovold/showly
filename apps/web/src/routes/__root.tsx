import { env } from "cloudflare:workers";
import { TanStackDevtools } from "@tanstack/react-devtools";
// import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import appCss from "../index.css?url";

const getAPIUrl = createServerFn({ method: "GET" }).handler(() => env.API_URL);

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "My App",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	beforeLoad: async () => ({
		API_URL: await getAPIUrl(),
	}),
	component: RootDocument,
});

function RootDocument() {
	return (
		<html className="dark" lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<div className="grid h-svh grid-rows-[auto_1fr]">
					<Outlet />
				</div>
				{/* <Toaster richColors /> */}
				<TanStackDevtools
					plugins={[
						// {
						//   name: "TanStack Query",
						//   render: <ReactQueryDevtoolsPanel />,
						//   defaultOpen: true,
						// },
						{
							name: "TanStack Router",
							render: <TanStackRouterDevtoolsPanel />,
							defaultOpen: false,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
