import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { Bell, Search, Menu, Briefcase, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
  },
  component: AuthenticatedLayout,
});

type Notif = { id: string; action: string; created_at: string; metadata: unknown };

function TopNav() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      setUserId(data.user?.id ?? "");
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("activity_logs")
      .select("id, action, created_at, metadata")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        const rows = (data ?? []) as Notif[];
        setNotifs(rows);
        const seenAt = Number(localStorage.getItem("notifs_seen_at") ?? 0);
        setUnread(rows.filter((r) => new Date(r.created_at).getTime() > seenAt).length);
      });
  }, [userId, bellOpen]);

  const init = (email.split("@")[0]?.[0] ?? "U").toUpperCase();
  const displayName = email ? email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Guest";

  const openBell = (open: boolean) => {
    setBellOpen(open);
    if (open) {
      localStorage.setItem("notifs_seen_at", String(Date.now()));
      setUnread(0);
    }
  };

  const signOut = async () => {
    setAvatarOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="h-14 sticky top-0 z-30 bg-card border-b border-border shadow-card">
      <div className="h-full flex items-center gap-2 px-3 md:px-4">
        <SidebarTrigger className="md:hidden size-9 shrink-0" aria-label="Open menu">
          <Menu className="size-5" />
        </SidebarTrigger>
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <Briefcase className="size-6 text-primary" strokeWidth={2.5} />
          <span className="font-bold text-foreground text-base" style={{ fontFamily: "'Sora', sans-serif" }}>
            ApplyTrack
          </span>
        </Link>
        <div className="flex-1 max-w-md hidden md:flex items-center gap-2 bg-muted rounded-md px-3 h-9 ml-2 border border-transparent focus-within:border-primary focus-within:bg-card">
          <Search className="size-4 text-muted-foreground" />
          <input placeholder="Search jobs, companies…" className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
        </div>
        <div className="flex-1 md:hidden" />

        <Popover open={bellOpen} onOpenChange={openBell}>
          <PopoverTrigger asChild>
            <button className="relative size-10 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground" aria-label="Notifications">
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-destructive text-[10px] font-semibold text-white flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-80 p-0 z-[999]">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-semibold text-sm">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifs.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No notifications yet</p>
              ) : (
                <ul className="divide-y divide-border">
                  {notifs.map((n) => (
                    <li key={n.id} className="px-4 py-3 hover:bg-muted cursor-pointer" onClick={() => setBellOpen(false)}>
                      <p className="text-sm text-foreground">{n.action.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={avatarOpen} onOpenChange={setAvatarOpen}>
          <PopoverTrigger asChild>
            <button
              className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold"
              aria-label="Account menu"
            >
              {init}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-64 p-0 z-[999]">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
            <div className="p-1">
              <button
                onClick={() => { setAvatarOpen(false); navigate({ to: "/dashboard/settings" }); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted text-foreground"
              >
                <SettingsIcon className="size-4" /> Settings
              </button>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted text-destructive"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav />
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
