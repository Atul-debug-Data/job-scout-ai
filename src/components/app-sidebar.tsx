import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard, Briefcase, Mail, Mic, FileText, Settings, LogOut,
  Shield, Users, ScrollText, Flag,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Applications", url: "/dashboard/applications", icon: Briefcase },
  { title: "Gmail Sync", url: "/dashboard/gmail", icon: Mail },
  { title: "Interview Prep", url: "/dashboard/interview", icon: Mic },
  { title: "Resumes", url: "/dashboard/resumes", icon: FileText },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const adminItems = [
  { title: "Overview", url: "/admin", icon: Shield },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Activity Logs", url: "/admin/logs", icon: ScrollText },
  { title: "Feature Flags", url: "/admin/flags", icon: Flag },
];

function initials(email: string) {
  if (!email) return "U";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || name[0].toUpperCase();
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string>("");

  const checkAdmin = useServerFn(checkIsAdmin);
  const { data: adminData } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const isActive = (url: string) =>
    url === "/dashboard" || url === "/admin"
      ? pathname === url
      : pathname.startsWith(url);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const displayName = email ? email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Guest";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-0">
        {!collapsed ? (
          <div className="bg-card border-b border-border">
            <div className="h-14 bg-gradient-to-r from-primary to-primary-glow" />
            <div className="px-4 pb-4 -mt-8">
              <div className="size-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold ring-4 ring-card">
                {initials(email)}
              </div>
              <p className="mt-2 font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
              <Link to="/dashboard/settings" className="text-xs font-semibold text-primary hover:underline mt-1 inline-block">
                View profile
              </Link>
            </div>
          </div>
        ) : (
          <Link to="/dashboard" className="flex items-center justify-center py-3">
            <div className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              in
            </div>
          </Link>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="label-uppercase">Manage</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={`relative rounded-none h-10 ${active ? "!bg-accent !text-primary font-semibold" : "hover:bg-muted text-foreground"}`}
                    >
                      <Link to={item.url} className="flex items-center gap-3 pl-4">
                        {active && <span className="absolute left-0 top-0 h-full w-1 bg-primary" />}
                        <item.icon className="size-5 shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {adminData?.is_admin && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel className="label-uppercase">Admin</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={`relative rounded-none h-10 ${active ? "!bg-accent !text-primary font-semibold" : "hover:bg-muted text-foreground"}`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 pl-4">
                          {active && <span className="absolute left-0 top-0 h-full w-1 bg-primary" />}
                          <item.icon className="size-5 shrink-0" />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="size-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
