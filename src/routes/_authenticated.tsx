import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { Bell, Search, Menu, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
  },
  component: AuthenticatedLayout,
});

function TopNav() {
  const [email, setEmail] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);
  const init = (email.split("@")[0]?.[0] ?? "U").toUpperCase();

  return (
    <header className="h-14 sticky top-0 z-30 bg-card border-b border-border shadow-card">
      <div className="h-full flex items-center gap-2 px-3 md:px-4">
        <SidebarTrigger className="md:hidden size-9 shrink-0" aria-label="Open menu">
          <Menu className="size-5" />
        </SidebarTrigger>
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <Briefcase className="size-6 text-primary" strokeWidth={2.5} />
          <span
            className="font-bold text-foreground text-base"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            ApplyTrack
          </span>
        </Link>
        <div className="flex-1 max-w-md hidden md:flex items-center gap-2 bg-muted rounded-md px-3 h-9 ml-2 border border-transparent focus-within:border-primary focus-within:bg-card">
          <Search className="size-4 text-muted-foreground" />
          <input
            placeholder="Search jobs, companies…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex-1 md:hidden" />
        <button className="relative size-10 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground" aria-label="Notifications">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
        </button>
        <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
          {init}
        </div>
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
