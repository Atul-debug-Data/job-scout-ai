import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — ApplyTrack" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[Login] mount — checking existing session");
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error("[Login] getSession error:", error);
          setError(`Connection error: ${error.message}`);
          return;
        }
        console.log("[Login] existing session:", data.session?.user?.email ?? "none");
        if (data.session) navigate({ to: "/dashboard", replace: true });
      })
      .catch((e) => {
        console.error("[Login] getSession threw:", e);
        setError(`Cannot reach backend: ${e instanceof Error ? e.message : String(e)}`);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Login] auth event:", event, session?.user?.email);
      if (event === "SIGNED_IN" && session) {
        navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Login] submit clicked, email:", email);
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("[Login] signInWithPassword result:", { user: data?.user?.email, error });
      if (error) {
        setError(error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success("Signed in!");
      console.log("[Login] navigating to /dashboard");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      console.error("[Login] unexpected error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    console.log("[Login] google clicked");
    setError(null);
    setLoading(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
      console.log("[Login] google result:", res);
      if (res.error) {
        setError(res.error.message);
        toast.error(res.error.message);
      }
    } catch (err) {
      console.error("[Login] google threw:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue tracking your applications."
      footer={<>Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link></>}
    >
      <form onSubmit={handleEmail} className="space-y-4">
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
      </form>
      <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/60" /></div><div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div></div>
      <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>Continue with Google</Button>
    </AuthShell>
  );
}
