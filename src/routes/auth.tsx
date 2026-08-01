import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Srinivas M" },
      { name: "description", content: "Private admin sign in for the portfolio project manager." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin sign in — Srinivas M" },
      { property: "og:description", content: "Private admin sign in." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-5 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        // sudo login
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Admin access</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Private area for managing projects. Visitors can head back to the{" "}
        <Link to="/projects" className="text-accent hover:underline">
          projects page
        </Link>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="font-mono text-xs text-muted-foreground">
            email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1.5 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="password" className="font-mono text-xs text-muted-foreground">
            password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full rounded-sm border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary"
      >
        Continue with Google
      </button>
    </div>
  );
}
