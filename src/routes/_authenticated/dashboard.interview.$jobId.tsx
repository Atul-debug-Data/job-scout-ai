import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { listSessions, generateQuestions, gradeAnswer } from "@/lib/interview.functions";
import { getJob } from "@/lib/jobs.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard/interview/$jobId")({
  head: () => ({ meta: [{ title: "Interview Prep — ApplyTrack" }] }),
  component: InterviewPage,
});

type Q = { question: string; tip: string };
type F = { score: number; strengths: string; improvements: string };

function InterviewPage() {
  const { jobId } = Route.useParams();
  const qc = useQueryClient();
  const getJobFn = useServerFn(getJob);
  const listFn = useServerFn(listSessions);
  const genFn = useServerFn(generateQuestions);
  const gradeFn = useServerFn(gradeAnswer);

  const { data: jobData } = useQuery({ queryKey: ["job", jobId], queryFn: () => getJobFn({ data: { id: jobId } }) });
  const { data: sessions, isLoading } = useQuery({ queryKey: ["sessions"], queryFn: () => listFn() });
  const session = (sessions ?? []).find(s => s.job_id === jobId);

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => { setAnswer(""); }, [activeIdx]);

  const generate = useMutation({
    mutationFn: () => genFn({ data: { job_id: jobId } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sessions"] }); toast.success("Questions ready"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const grade = useMutation({
    mutationFn: (i: number) => gradeFn({ data: { session_id: session!.id, question_index: i, answer } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sessions"] }); toast.success("Feedback ready"); setActiveIdx(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const questions = (session?.questions as unknown as Q[]) ?? [];
  const feedback = (session?.feedback as unknown as F[]) ?? [];
  const answers = (session?.answers as unknown as string[]) ?? [];

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/dashboard/interview" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"><ArrowLeft className="size-3" /> Back</Link>
      <div>
        <h1 className="font-display text-3xl font-semibold">{jobData?.job.company}</h1>
        <p className="text-muted-foreground">{jobData?.job.title}</p>
      </div>

      {isLoading ? <Skeleton className="h-40" /> : !session ? (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
          <Sparkles className="size-8 text-primary mx-auto" />
          <h2 className="mt-3 font-semibold">Generate 10 tailored interview questions</h2>
          <p className="text-sm text-muted-foreground mt-1">AI will research the company and role to prepare you.</p>
          <Button className="mt-6" onClick={() => generate.mutate()} disabled={generate.isPending}>
            {generate.isPending ? <><Loader2 className="size-4 animate-spin" /> Generating...</> : "Generate questions"}
          </Button>
        </div>
      ) : (
        <>
          {session.company_summary && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <p className="text-xs uppercase tracking-wider text-primary mb-2">Company brief</p>
              <p className="text-sm">{session.company_summary}</p>
            </div>
          )}
          <div className="space-y-3">
            {questions.map((q, i) => {
              const fb = feedback[i];
              const isActive = activeIdx === i;
              return (
                <div key={i} className="rounded-2xl border border-border/60 bg-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Q{i + 1}</p>
                      <p className="font-medium mt-1">{q.question}</p>
                      <p className="text-xs text-muted-foreground mt-2 italic">Tip: {q.tip}</p>
                    </div>
                    {fb && <Badge variant="outline" className="text-primary border-primary/40">{fb.score}/10</Badge>}
                  </div>
                  {answers[i] && !isActive && (
                    <div className="mt-3 text-sm bg-background/50 rounded p-3">
                      <p className="text-xs text-muted-foreground mb-1">Your answer:</p>
                      <p className="text-foreground/80">{answers[i]}</p>
                    </div>
                  )}
                  {fb && !isActive && (
                    <div className="mt-3 text-xs space-y-1">
                      <p><span className="text-success">✓ </span>{fb.strengths}</p>
                      <p><span className="text-warning">→ </span>{fb.improvements}</p>
                    </div>
                  )}
                  {isActive ? (
                    <div className="mt-4 space-y-2">
                      <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer..." rows={4} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => grade.mutate(i)} disabled={grade.isPending || !answer.trim()}>
                          {grade.isPending ? <><Loader2 className="size-3 animate-spin" /> Grading...</> : "Submit for AI feedback"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setActiveIdx(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => { setActiveIdx(i); setAnswer(answers[i] ?? ""); }}>
                      {answers[i] ? "Retry answer" : "Answer"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
