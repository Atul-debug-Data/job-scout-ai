import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { Bell, Search, LayoutDashboard, Briefcase, Mail, Mic, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
  },
  component: AuthenticatedLayout,
});

const mobileNav = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard },
  { title: "Jobs", url: "/dashboard/applications", icon: Briefcase },
  { title: "Gmail", url: "/dashboard/gmail", icon: Mail },
  { title: "Prep", url: "/dashboard/interview", icon: Mic },
  { title: "More", url: "/dashboard/settings", icon: MoreHorizontal },
];

function TopNav() {
  const [email, setEmail] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);
  const init = (email.split("@")[0]?.[0] ?? "U").toUpperCase();

  return (
    <header className="h-14 sticky top-0 z-30 bg-card border-b border-border shadow-card">
      <div className="h-full flex items-center gap-3 px-4">
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">in</div>
          <span className="font-semibold text-foreground hidden sm:inline">ApplyTrack</span>
        </Link>
        <div className="flex-1 max-w-md hidden md:flex items-center gap-2 bg-muted rounded-md px-3 h-9 border border-transparent focus-within:border-primary focus-within:bg-card">
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

function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => url === "/dashboard" ? pathname === url : pathname.startsWith(url);
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border h-14 flex items-center justify-around">
      {mobileNav.map((item) => {
        const active = isActive(item.url);
        return (
          <Link
            key={item.title}
            to={item.url}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full ${active ? "text-primary" : "text-muted-foreground"}`}
          >
            {active && <span className="absolute top-0 h-0.5 w-12 bg-primary" />}
            <item.icon className="size-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav />
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden pb-20 md:pb-8">
            <Outlet />
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
