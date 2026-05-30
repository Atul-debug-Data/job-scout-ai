import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — ApplyTrack" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setPassword(""); }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account.</p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="font-semibold mb-4">Profile</h2>
        <Label>Email</Label>
        <Input value={email} disabled className="mt-1" />
      </div>
      <form onSubmit={changePassword} className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
        <h2 className="font-semibold">Change password</h2>
        <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
        <Button type="submit" disabled={loading || !password}>{loading ? "Updating..." : "Update password"}</Button>
      </form>
      <div className="rounded-2xl border border-destructive/30 bg-card p-6">
        <h2 className="font-semibold">Sign out</h2>
        <p className="text-sm text-muted-foreground mt-1">End your current session.</p>
        <Button variant="destructive" className="mt-4" onClick={signOut}>Sign out</Button>
      </div>
    </div>
  );
}
