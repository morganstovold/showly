import { authClient } from "@showly/auth/client";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getCurrentUser } from "../lib/auth";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async ({ location, context }) => {
		const user = await getCurrentUser();

		if (!user) {
			throw redirect({
				to: "/auth",
				search: { redirect: location.href },
			});
		}

		return { user, API_URL: context.API_URL };
	},
	component: DashboardComponent,
});

function DashboardComponent() {
	const { user, API_URL } = Route.useRouteContext();
	const navigate = useNavigate();

	const [apiResponse, setApiResponse] = useState<JSON | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchUserData = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`${API_URL}/v1/me`, {
				credentials: "include", // Important: send cookies
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}

			const data = (await response.json()) as JSON;
			setApiResponse(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch");
			setApiResponse(null);
		} finally {
			setLoading(false);
		}
	};

	const handleSignOut = async () => {
		await authClient.signOut();
		navigate({ to: "/auth" });
	};

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
						<p className="mt-2 text-muted-foreground">
							Welcome back, {user.name || user.email}
						</p>
					</div>
					<button
						className="rounded-md bg-secondary px-4 py-2 font-medium text-secondary-foreground text-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
						onClick={handleSignOut}
						type="button"
					>
						Sign out
					</button>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
						<h3 className="font-semibold text-lg">Profile</h3>
						<div className="mt-4 space-y-2">
							<p className="text-sm">
								<span className="font-medium">Email:</span> {user.email}
							</p>
							{user.name ? (
								<p className="text-sm">
									<span className="font-medium">Name:</span> {user.name}
								</p>
							) : null}
						</div>
					</div>

					<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
						<h3 className="font-semibold text-lg">Quick Stats</h3>
						<p className="mt-4 text-muted-foreground text-sm">
							Your dashboard content goes here
						</p>
					</div>

					<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
						<h3 className="font-semibold text-lg">Recent Activity</h3>
						<p className="mt-4 text-muted-foreground text-sm">
							No recent activity to display
						</p>
					</div>
				</div>

				{/* API Test Section */}
				<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold text-lg">API Test: /api/v1/me</h3>
						<button
							className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
							disabled={loading}
							onClick={fetchUserData}
							type="button"
						>
							{loading ? "Loading..." : "Fetch Data"}
						</button>
					</div>

					<div className="mt-4">
						<p className="mb-2 text-muted-foreground text-sm">
							API URL:{" "}
							<code className="rounded bg-muted px-1 py-0.5">{API_URL}</code>
						</p>

						{error !== null && (
							<div className="rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm">
								Error: {error}
							</div>
						)}

						{apiResponse !== null && (
							<div className="overflow-auto rounded-md bg-muted p-4">
								<pre className="text-xs">
									{JSON.stringify(apiResponse, null, 2)}
								</pre>
							</div>
						)}

						{!(apiResponse || error || loading) && (
							<p className="text-muted-foreground text-sm italic">
								Click "Fetch Data" to test the API endpoint
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
