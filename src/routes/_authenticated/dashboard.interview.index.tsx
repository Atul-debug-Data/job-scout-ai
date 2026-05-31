import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { listJobs } from "@/lib/jobs.functions";
import { listSessions } from "@/lib/interview.functions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard/interview/")({
  head: () => ({ meta: [{ title: "AI Interview Prep — ApplyTrack" }] }),
  component: InterviewListPage,
});

function InterviewListPage() {
  const jobsFn = useServerFn(listJobs);
  const sessionsFn = useServerFn(listSessions);
  const { data: jobs, isLoading } = useQuery({ queryKey: ["jobs"], queryFn: () => jobsFn() });
  const { data: sessions } = useQuery({ queryKey: ["sessions"], queryFn: () => sessionsFn() });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">AI Interview Prep</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Pick a job to generate tailored interview questions.</p>
      </div>
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        ) : (jobs ?? []).length === 0 ? (
          <p className="text-muted-foreground p-12 text-center text-sm">Add jobs first to generate interview questions.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(jobs ?? []).map(j => {
              const sess = (sessions ?? []).find(s => s.job_id === j.id);
              return (
                <li key={j.id} className="p-4 hover:bg-secondary/60 transition-colors flex items-center gap-4">
                  <div className="size-12 rounded bg-secondary text-primary flex items-center justify-center font-semibold shrink-0">
                    {j.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{j.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{j.company}{j.location ? ` · ${j.location}` : ""}</p>
                    {sess && <p className="text-xs text-success mt-0.5">Prep in progress</p>}
                  </div>
                  <Link to="/dashboard/interview/$jobId" params={{ jobId: j.id }}>
                    <Button variant="outline" className="rounded-full font-semibold border-primary text-primary hover:bg-secondary">
                      <Sparkles className="size-4" /> {sess ? "Continue" : "Prepare"}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
