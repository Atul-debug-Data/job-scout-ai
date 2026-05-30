import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Briefcase, Eye, Phone, CheckCircle2, XCircle } from "lucide-react";
import { getDashboardStats } from "@/lib/jobs.functions";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — ApplyTrack" }] }),
  component: DashboardPage,
});

const STATUS_META = {
  applied: { label: "Applied", icon: Briefcase, color: "text-primary bg-primary/10" },
  in_review: { label: "In Review", icon: Eye, color: "text-warning bg-warning/10" },
  interview: { label: "Interview", icon: Phone, color: "text-chart-4 bg-chart-4/10" },
  offer: { label: "Offer", icon: CheckCircle2, color: "text-success bg-success/10" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-destructive bg-destructive/10" },
} as const;

function DashboardPage() {
  const fn = useServerFn(getDashboardStats);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => fn() });

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your job search at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((k, i) => {
          const meta = STATUS_META[k];
          return (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border/60 bg-card p-4"
            >
              <div className={`size-9 rounded-lg flex items-center justify-center ${meta.color}`}>
                <meta.icon className="size-4" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{meta.label}</p>
              {isLoading
                ? <Skeleton className="h-7 w-12 mt-1" />
                : <p className="font-display text-2xl font-semibold">{data?.counts[k] ?? 0}</p>}
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Pipeline</h2>
          <div className="grid grid-cols-5 gap-2 min-h-[280px]">
            {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((k) => {
              const jobs = (data?.jobs ?? []).filter(j => j.status === k);
              return (
                <div key={k} className="bg-background/50 rounded-lg p-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{STATUS_META[k].label}</p>
                  <div className="space-y-2">
                    {jobs.slice(0, 4).map(j => (
                      <div key={j.id} className="rounded-md border border-border/40 bg-card p-2">
                        <p className="text-xs font-medium truncate">{j.company}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{j.title}</p>
                      </div>
                    ))}
                    {jobs.length === 0 && <p className="text-[10px] text-muted-foreground/50 text-center py-4">—</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Recent activity</h2>
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
