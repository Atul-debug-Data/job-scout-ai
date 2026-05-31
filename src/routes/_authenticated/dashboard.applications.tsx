import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { listJobs, createJob, updateJob, deleteJob } from "@/lib/jobs.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard/applications")({
  head: () => ({ meta: [{ title: "Applications — ApplyTrack" }] }),
  component: ApplicationsPage,
});

const STATUSES = ["applied", "in_review", "interview", "offer", "rejected"] as const;
type Status = typeof STATUSES[number];

const STATUS_COLOR: Record<Status, string> = {
  applied: "bg-secondary text-primary border-primary/20",
  in_review: "bg-[#FFF4E5] text-[#B24020] border-[#B24020]/20",
  interview: "bg-[#F0EAFF] text-[#6E3FE7] border-[#6E3FE7]/20",
  offer: "bg-[#E6F4EC] text-success border-success/20",
  rejected: "bg-[#FDEAEB] text-destructive border-destructive/20",
};

const AVATAR_COLORS = [
  "bg-[#0A66C2]", "bg-[#057642]", "bg-[#B24020]", "bg-[#6E3FE7]",
  "bg-[#CC1016]", "bg-[#915EFF]", "bg-[#1F73B7]", "bg-[#8E5A00]",
];
function avatarColor(seed: string) {
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function ApplicationsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listJobs);
  const createFn = useServerFn(createJob);
  const updateFn = useServerFn(updateJob);
  const deleteFn = useServerFn(deleteJob);
  const { data: jobs, isLoading } = useQuery({ queryKey: ["jobs"], queryFn: () => listFn() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ company: "", title: "", portal: "", location: "" });

  const create = useMutation({
    mutationFn: (data: typeof form) => createFn({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setOpen(false);
      setForm({ company: "", title: "", portal: "", location: "" });
      toast.success("Job added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) => updateFn({ data: { id, status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Deleted");
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Applications</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{jobs?.length ?? 0} total</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full font-semibold"><Plus className="size-4" /> Add Job</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add application</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-3">
              <div><Label>Company</Label><Input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1" /></div>
              <div><Label>Role title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
              <div><Label>Portal</Label><Input value={form.portal} onChange={(e) => setForm({ ...form, portal: e.target.value })} placeholder="LinkedIn, careers.x.com..." className="mt-1" /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1" /></div>
              <DialogFooter><Button type="submit" disabled={create.isPending} className="rounded-full">{create.isPending ? "Saving..." : "Save"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : (jobs ?? []).length === 0 ? (
          <p className="text-center text-muted-foreground py-16 text-sm">No applications yet — add one or sync Gmail.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(jobs ?? []).map(j => (
              <li key={j.id} className="flex items-center gap-4 p-4 hover:bg-secondary/60 transition-colors">
                <div className={`size-12 rounded-full ${avatarColor(j.company)} text-white flex items-center justify-center font-semibold text-base shrink-0`}>
                  {j.company.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{j.company}</p>
                  <p className="text-sm text-muted-foreground truncate">{j.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{j.source} · Applied {new Date(j.applied_date).toLocaleDateString()}</p>
                </div>
                <Select value={j.status} onValueChange={(v) => update.mutate({ id: j.id, status: v as Status })}>
                  <SelectTrigger className={`w-[120px] text-xs h-7 rounded-full border font-medium ${STATUS_COLOR[j.status as Status]}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Link to="/dashboard/interview/$jobId" params={{ jobId: j.id }}>
                    <Button size="icon" variant="ghost" title="AI Interview prep" className="rounded-full text-primary"><Sparkles className="size-4" /></Button>
                  </Link>
                  <Button size="icon" variant="ghost" onClick={() => del.mutate(j.id)} className="rounded-full text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
