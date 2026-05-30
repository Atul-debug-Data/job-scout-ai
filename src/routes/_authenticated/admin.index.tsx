import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, Briefcase, Sparkles, FileText, Activity } from "lucide-react";
import { adminStats } from "@/lib/admin.functions";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — ApplyTrack" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const fn = useServerFn(adminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });
  const items = [
    { Icon: Users, label: "Total users", val: data?.total_users },
    { Icon: Briefcase, label: "Total jobs", val: data?.total_jobs },
    { Icon: Sparkles, label: "Interview sessions", val: data?.total_sessions },
    { Icon: FileText, label: "Resumes", val: data?.total_resumes },
    { Icon: Activity, label: "Active this week", val: data?.active_this_week },
  ];
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-3xl font-semibold">Admin Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">System-wide statistics.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {items.map(({ Icon, label, val }) => (
          <div key={label} className="rounded-2xl border border-border/60 bg-card p-4">
            <Icon className="size-5 text-primary" />
            <p className="text-xs text-muted-foreground mt-2">{label}</p>
            {isLoading ? <Skeleton className="h-7 w-12 mt-1" /> : <p className="font-display text-2xl font-semibold">{val ?? 0}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
