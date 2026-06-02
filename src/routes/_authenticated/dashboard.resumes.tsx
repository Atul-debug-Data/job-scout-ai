import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { UploadCloud, FileText, Trash2, Sparkles, Loader2 } from "lucide-react";
import { listResumes, createResumeRecord, deleteResume, scoreResume } from "@/lib/resumes.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard/resumes")({
  head: () => ({ meta: [{ title: "Resumes — ApplyTrack" }] }),
  component: ResumesPage,
});

function ResumesPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listResumes);
  const createFn = useServerFn(createResumeRecord);
  const deleteFn = useServerFn(deleteResume);
  const scoreFn = useServerFn(scoreResume);

  const { data: resumes, isLoading } = useQuery({ queryKey: ["resumes"], queryFn: () => listFn() });
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const finalLabel = label.trim() || file.name.replace(/\.[^/.]+$/, "");
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("resumes").upload(path, file);
      if (error) throw error;
      await createFn({ data: { file_path: path, label: finalLabel } });
      qc.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume uploaded");
      setLabel("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally { setUploading(false); }
  };


  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["resumes"] }); toast.success("Deleted"); },
  });

  const score = useMutation({
    mutationFn: (id: string) => scoreFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["resumes"] }); toast.success("Scored"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Resumes</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Upload, score with AI, and tag per role.</p>
      </div>

      <div className="bg-card rounded-lg border-2 border-dashed border-border p-8 text-center">
        <div className="size-12 rounded-full bg-secondary text-primary flex items-center justify-center mx-auto">
          <UploadCloud className="size-6" />
        </div>
        <h3 className="mt-3 font-semibold text-foreground">Upload a resume</h3>
        <p className="text-sm text-muted-foreground mt-1">PDF, DOC, or DOCX</p>
        <div className="mt-4 max-w-md mx-auto space-y-3 text-left">
          <div>
            <Label className="text-xs">Label <span className="text-muted-foreground font-normal">(optional — defaults to filename)</span></Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Senior FE Resume v3" className="mt-1 bg-background" />

          </div>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={onUpload} className="hidden" id="resume-file" />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-full w-full font-semibold">
            {uploading ? <><Loader2 className="size-4 animate-spin" /> Uploading...</> : <><UploadCloud className="size-4" /> Upload resume</>}
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {isLoading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />) :
          (resumes ?? []).length === 0 ? (
            <p className="col-span-full text-muted-foreground text-sm text-center py-8">No resumes yet.</p>
          ) : (resumes ?? []).map(r => {
            const fb = r.ai_feedback as { strengths?: string[]; improvements?: string[]; summary?: string } | null;
            return (
              <div key={r.id} className="rounded-lg border border-border bg-card p-5 shadow-card hover-lift">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-secondary text-primary flex items-center justify-center"><FileText className="size-5" /></div>
                    <div>
                      <p className="font-semibold text-foreground">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {r.ai_score != null && (
                    <div className="text-right px-2 py-1 rounded-full bg-secondary border border-primary/20">
                      <span className="font-semibold text-primary text-sm">{r.ai_score}</span>
                      <span className="text-[10px] text-muted-foreground"> / 100</span>
                    </div>
                  )}
                </div>
                {fb?.summary && <p className="text-xs text-muted-foreground mt-3">{fb.summary}</p>}
                {fb?.improvements && fb.improvements.length > 0 && (
                  <ul className="mt-3 text-xs space-y-1 text-foreground">
                    {fb.improvements.slice(0, 3).map((s, i) => <li key={i}>→ {s}</li>)}
                  </ul>
                )}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => score.mutate(r.id)} disabled={score.isPending} className="rounded-full border-primary text-primary hover:bg-secondary">
                    <Sparkles className="size-3" /> {r.ai_score != null ? "Re-score" : "AI Score"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => del.mutate(r.id)} className="rounded-full text-muted-foreground hover:text-destructive"><Trash2 className="size-3" /></Button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
