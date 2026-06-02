import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Phone, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { getDashboardStats } from "@/lib/jobs.functions";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — ApplyTrack" }] }),
  component: DashboardPage,
});

const STAT_CARDS = [
  { key: "applied",   label: "Applied",   icon: Briefcase,    accent: "text-primary",      bg: "bg-primary/10" },
  { key: "interview", label: "Interview", icon: Phone,        accent: "text-[#6E3FE7]",    bg: "bg-[#F0EAFF]" },
  { key: "offer",     label: "Offer",     icon: CheckCircle2, accent: "text-success",      bg: "bg-[#E6F4EC]" },
  { key: "rejected",  label: "Rejected",  icon: XCircle,      accent: "text-destructive",  bg: "bg-[#FDEAEB]" },
] as const;

function DashboardPage() {
  const fn = useServerFn(getDashboardStats);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => fn() });
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const e = data.user?.email ?? "";
      setName(e ? e.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "");
    });
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {greet}{name ? `, ${name}` : ""} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Here's your job search at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-border bg-card p-4 md:p-5 shadow-card hover-lift"
          >
            <div className={`size-10 rounded-full ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`size-5 ${card.accent}`} />
            </div>
            <p className="label-uppercase text-[10px]">{card.label}</p>
            {isLoading
              ? <Skeleton className="h-9 w-14 mt-2" />
              : <p className="mt-1 text-3xl md:text-4xl font-semibold text-foreground">{data?.counts[card.key] ?? 0}</p>}
          </motion.div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent activity</h2>
          <Link to="/pipeline" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            View pipeline <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="p-5">
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (data?.activity ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {(data?.activity ?? []).map(a => (
                <div key={a.id} className="text-sm flex items-start gap-3">
                  <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-foreground truncate">{a.action.replace(/[._]/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
