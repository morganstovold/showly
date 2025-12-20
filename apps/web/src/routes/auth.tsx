import { authClient } from "@showly/auth/client";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getCurrentUser } from "../lib/auth";

export const Route = createFileRoute("/auth")({
	beforeLoad: async () => {
		const user = await getCurrentUser();
		if (user) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: AuthComponent,
});

function AuthComponent() {
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			if (isSignUp) {
				await authClient.signUp.email({
					email,
					password,
					name,
				});
			} else {
				await authClient.signIn.email({
					email,
					password,
				});
			}

			navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Authentication failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<h2 className="font-bold text-3xl tracking-tight">
						{isSignUp ? "Create an account" : "Sign in to your account"}
					</h2>
					<p className="mt-2 text-muted-foreground text-sm">
						{isSignUp ? (
							<>
								Already have an account?{" "}
								<button
									className="font-medium text-primary hover:underline"
									onClick={() => {
										setIsSignUp(!isSignUp);
										setError("");
									}}
									type="button"
								>
									Sign in
								</button>
							</>
						) : (
							<>
								Don't have an account?{" "}
								<button
									className="font-medium text-primary hover:underline"
									onClick={() => {
										setIsSignUp(!isSignUp);
										setError("");
									}}
									type="button"
								>
									Sign up
								</button>
							</>
						)}
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
						{isSignUp ? (
							<div>
								<label
									className="block font-medium text-foreground text-sm"
									htmlFor="name"
								>
									Name
								</label>
								<input
									className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									id="name"
									name="name"
									onChange={(e) => setName(e.target.value)}
									placeholder="John Doe"
									required={isSignUp}
									type="text"
									value={name}
								/>
							</div>
						) : null}

						<div>
							<label
								className="block font-medium text-foreground text-sm"
								htmlFor="email"
							>
								Email address
							</label>
							<input
								autoComplete="email"
								className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								id="email"
								name="email"
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								required
								type="email"
								value={email}
							/>
						</div>

						<div>
							<label
								className="block font-medium text-foreground text-sm"
								htmlFor="password"
							>
								Password
							</label>
							<input
								autoComplete={isSignUp ? "new-password" : "current-password"}
								className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								id="password"
								name="password"
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
								type="password"
								value={password}
							/>
						</div>

						{error.length > 0 && (
							<div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
								{error}
							</div>
						)}

						<button
							className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={loading}
							type="submit"
						>
							{loading ? "Loading..." : isSignUp ? "Sign up" : "Sign in"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
