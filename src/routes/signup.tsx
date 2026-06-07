import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — ApplyTrack" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    console.log("[Signup] mount — checking session");
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error("[Signup] getSession error:", error);
          setError(`Connection error: ${error.message}`);
          return;
        }
        console.log("[Signup] existing session:", data.session?.user?.email ?? "none");
        if (data.session) navigate({ to: "/dashboard", replace: true });
      })
      .catch((e) => {
        console.error("[Signup] getSession threw:", e);
        setError(`Cannot reach backend: ${e instanceof Error ? e.message : String(e)}`);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Signup] auth event:", event, session?.user?.email);
      if (event === "SIGNED_IN" && session) {
        navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Signup] submit clicked", { email, name });
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/dashboard", data: { name } },
      });
      console.log("[Signup] signUp result:", { user: data?.user?.email, hasSession: !!data?.session, error });
      if (error) {
        setError(error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        toast.success("Welcome to ApplyTrack!");
        console.log("[Signup] session created, navigating to /dashboard");
        navigate({ to: "/dashboard", replace: true });
      } else {
        const msg = "Account created! Check your email to verify, then log in.";
        setSuccess(msg);
        toast.success(msg);
        setLoading(false);
      }
    } catch (err) {
      console.error("[Signup] unexpected error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    console.log("[Signup] google clicked");
    setError(null);
    try {
      const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
      console.log("[Signup] google result:", res);
      if (res.error) {
        setError(res.error.message);
        toast.error(res.error.message);
      }
    } catch (err) {
      console.error("[Signup] google threw:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking jobs in under 30 seconds."
      footer={<>Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link></>}
    >
      <form onSubmit={handle} className="space-y-4">
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground">
            {success}
          </div>
        )}
        <div><Label htmlFor="name">Name</Label><Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
        <div><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" /></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
      </form>
      <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/60" /></div><div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div></div>
      <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>Continue with Google</Button>
    </AuthShell>
  );
}
