import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Briefcase, Eye, Phone, CheckCircle2, XCircle } from "lucide-react";
import { getDashboardStats } from "@/lib/jobs.functions";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({ meta: [{ title: "Pipeline — ApplyTrack" }] }),
  component: PipelinePage,
});

const COLUMNS = [
  { key: "applied",   label: "Applied",   icon: Briefcase,    bar: "bg-primary" },
  { key: "in_review", label: "In Review", icon: Eye,          bar: "bg-[#B24020]" },
  { key: "interview", label: "Interview", icon: Phone,        bar: "bg-[#6E3FE7]" },
  { key: "offer",     label: "Offer",     icon: CheckCircle2, bar: "bg-success" },
  { key: "rejected",  label: "Rejected",  icon: XCircle,      bar: "bg-destructive" },
] as const;

function PipelinePage() {
  const fn = useServerFn(getDashboardStats);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => fn() });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Pipeline</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Track every application by stage.</p>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card overflow-x-auto">
        <div className="flex gap-3 p-4 min-w-max">
          {COLUMNS.map((col) => {
            const jobs = (data?.jobs ?? []).filter(j => j.status === col.key);
            return (
              <div key={col.key} className="w-[280px] shrink-0 bg-background rounded-md overflow-hidden flex flex-col">
                <div className={`h-1 ${col.bar}`} />
                <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <col.icon className="size-4 text-muted-foreground" />
                    <p className="label-uppercase text-[10px]">{col.label}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">{jobs.length}</span>
                </div>
                <div className="p-2 space-y-2 min-h-[300px]">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-16" />
                      <Skeleton className="h-16" />
                    </>
                  ) : jobs.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 text-center py-8">No applications</p>
                  ) : (
                    jobs.map(j => (
                      <div key={j.id} className="rounded-md border border-border bg-card p-3 shadow-card hover-lift">
                        <p className="text-sm font-semibold text-foreground break-words">{j.company}</p>
                        <p className="text-xs text-muted-foreground break-words mt-0.5">{j.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          {new Date(j.applied_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
