import { authClient } from "@showly/auth/client";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getCurrentUser } from "../lib/auth";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async ({ location }) => {
		const user = await getCurrentUser();

		if (!user) {
			throw redirect({
				to: "/auth",
				search: { redirect: location.href },
			});
		}

		return { user };
	},
	component: DashboardComponent,
});

function DashboardComponent() {
	const { user } = Route.useRouteContext();
	const navigate = useNavigate();

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
			</div>
		</div>
	);
}
