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
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-semibold">AI Interview Prep</h1>
        <p className="text-muted-foreground text-sm mt-1">Pick a job to generate tailored interview questions.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? [...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />) :
          (jobs ?? []).length === 0 ? (
            <p className="text-muted-foreground col-span-full">Add jobs first to generate interview questions.</p>
          ) : (jobs ?? []).map(j => {
            const sess = (sessions ?? []).find(s => s.job_id === j.id);
            return (
              <div key={j.id} className="rounded-2xl border border-border/60 bg-card p-5 hover:border-primary/50 transition-colors">
                <p className="font-semibold">{j.company}</p>
                <p className="text-sm text-muted-foreground">{j.title}</p>
                <Link to="/dashboard/interview/$jobId" params={{ jobId: j.id }} className="mt-4 block">
                  <Button className="w-full" variant={sess ? "outline" : "default"}>
                    <Sparkles className="size-4" /> {sess ? "Continue prep" : "Generate questions"}
                  </Button>
                </Link>
              </div>
            );
          })}
      </div>
    </div>
  );
}
