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
  applied:    { label: "Applied",    icon: Briefcase,    bar: "bg-primary",        accent: "text-primary" },
  in_review:  { label: "In Review",  icon: Eye,          bar: "bg-[#B24020]",      accent: "text-[#B24020]" },
  interview:  { label: "Interview",  icon: Phone,        bar: "bg-[#6E3FE7]",      accent: "text-[#6E3FE7]" },
  offer:      { label: "Offer",      icon: CheckCircle2, bar: "bg-success",        accent: "text-success" },
  rejected:   { label: "Rejected",   icon: XCircle,      bar: "bg-destructive",    accent: "text-destructive" },
} as const;

function DashboardPage() {
  const fn = useServerFn(getDashboardStats);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => fn() });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Your job search at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((k, i) => {
          const meta = STATUS_META[k];
          return (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-lg border border-border bg-card p-4 shadow-card hover-lift"
            >
              <div className="flex items-center justify-between">
                <meta.icon className={`size-5 ${meta.accent}`} />
                <p className="label-uppercase text-[10px]">{meta.label}</p>
              </div>
              {isLoading
                ? <Skeleton className="h-8 w-12 mt-3" />
                : <p className="mt-3 text-3xl font-semibold text-foreground">{data?.counts[k] ?? 0}</p>}
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-lg border border-border bg-card shadow-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground">Pipeline</h2>
          </div>
          <div className="grid grid-cols-5 gap-2 p-3 min-h-[280px]">
            {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((k) => {
              const meta = STATUS_META[k];
              const jobs = (data?.jobs ?? []).filter(j => j.status === k);
              return (
                <div key={k} className="bg-background rounded-md overflow-hidden flex flex-col">
                  <div className={`h-1 ${meta.bar}`} />
                  <div className="p-2 flex-1">
                    <p className="label-uppercase text-[9px] mb-2">{meta.label}</p>
                    <div className="space-y-2">
                      {jobs.slice(0, 4).map(j => (
                        <div key={j.id} className="rounded border border-border bg-card p-2 shadow-card hover-lift">
                          <p className="text-xs font-semibold truncate text-foreground">{j.company}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{j.title}</p>
                          <p className="text-[9px] text-muted-foreground text-right mt-1">{new Date(j.applied_date).toLocaleDateString()}</p>
                        </div>
                      ))}
                      {jobs.length === 0 && <p className="text-[10px] text-muted-foreground/60 text-center py-4">—</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-lg border border-border bg-card shadow-card">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent activity</h2>
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
    </div>
  );
}
