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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard/applications")({
  head: () => ({ meta: [{ title: "Applications — ApplyTrack" }] }),
  component: ApplicationsPage,
});

const STATUSES = ["applied", "in_review", "interview", "offer", "rejected"] as const;
type Status = typeof STATUSES[number];

const STATUS_COLOR: Record<Status, string> = {
  applied: "bg-primary/15 text-primary border-primary/30",
  in_review: "bg-warning/15 text-warning border-warning/30",
  interview: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  offer: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

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
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">{jobs?.length ?? 0} total</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4" /> Add Job</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add application</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-3">
              <div><Label>Company</Label><Input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1" /></div>
              <div><Label>Role title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" /></div>
              <div><Label>Portal</Label><Input value={form.portal} onChange={(e) => setForm({ ...form, portal: e.target.value })} placeholder="LinkedIn, careers.x.com..." className="mt-1" /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1" /></div>
              <DialogFooter><Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving..." : "Save"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? [...Array(5)].map((_, i) => (
              <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8" /></TableCell></TableRow>
            )) : (jobs ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-12">No applications yet — add one or sync Gmail.</TableCell></TableRow>
            ) : (jobs ?? []).map(j => (
              <TableRow key={j.id}>
                <TableCell className="font-medium">{j.company}</TableCell>
                <TableCell>{j.title}</TableCell>
                <TableCell>
                  <Select value={j.status} onValueChange={(v) => update.mutate({ id: j.id, status: v as Status })}>
                    <SelectTrigger className={`w-[130px] text-xs border ${STATUS_COLOR[j.status as Status]}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{j.source}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(j.applied_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Link to="/dashboard/interview/$jobId" params={{ jobId: j.id }}>
                      <Button size="icon" variant="ghost" title="AI Interview prep"><Sparkles className="size-4" /></Button>
                    </Link>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(j.id)}><Trash2 className="size-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
