import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import { getSyncStatus, connectGmail, syncGmail, listEmails, disconnectGmail } from "@/lib/gmail.functions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard/gmail")({
  head: () => ({ meta: [{ title: "Gmail Sync — ApplyTrack" }] }),
  component: GmailPage,
});

function GmailPage() {
  const qc = useQueryClient();
  const statusFn = useServerFn(getSyncStatus);
  const connectFn = useServerFn(connectGmail);
  const syncFn = useServerFn(syncGmail);
  const emailsFn = useServerFn(listEmails);
  const disconnectFn = useServerFn(disconnectGmail);

  const { data: status, isLoading } = useQuery({ queryKey: ["gmail-status"], queryFn: () => statusFn() });
  const { data: emails } = useQuery({ queryKey: ["emails"], queryFn: () => emailsFn(), enabled: !!status?.connected });

  const connect = useMutation({
    mutationFn: async () => { await connectFn(); return syncFn(); },
    onSuccess: (r) => {
      qc.invalidateQueries();
      toast.success(`Synced ${r.createdJobs} new and ${r.updatedJobs} existing jobs`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sync = useMutation({
    mutationFn: () => syncFn(),
    onSuccess: (r) => {
      qc.invalidateQueries();
      toast.success(`Synced ${r.createdJobs} new, ${r.updatedJobs} updated`);
    },
  });

  const disconnect = useMutation({
    mutationFn: () => disconnectFn(),
    onSuccess: () => { qc.invalidateQueries(); toast.success("Disconnected"); },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-semibold">Gmail Sync</h1>
        <p className="text-muted-foreground text-sm mt-1">Auto-parse job application emails. (Demo mode — uses mock emails.)</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6">
        {isLoading ? <Skeleton className="h-20" /> : status?.connected ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-success/15 text-success flex items-center justify-center"><CheckCircle2 className="size-5" /></div>
              <div>
                <p className="font-semibold">Gmail connected</p>
                <p className="text-xs text-muted-foreground">
                  {status.last_synced_at ? `Last sync ${new Date(status.last_synced_at).toLocaleString()}` : "Never synced"} · {status.email_count} emails
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => sync.mutate()} disabled={sync.isPending}>
                <RefreshCw className={`size-4 ${sync.isPending ? "animate-spin" : ""}`} /> Sync Now
              </Button>
              <Button variant="outline" onClick={() => disconnect.mutate()}>Disconnect</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="size-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mx-auto"><Mail className="size-6" /></div>
            <h3 className="mt-4 font-semibold">Connect Gmail to auto-track</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">We'll pull and parse application-related emails into your pipeline.</p>
            <Button className="mt-6" onClick={() => connect.mutate()} disabled={connect.isPending}>
              {connect.isPending ? "Connecting..." : "Connect Gmail (demo)"}
            </Button>
          </div>
        )}
      </div>

      {status?.connected && (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/40"><h2 className="font-semibold">Parsed emails</h2></div>
          <Table>
            <TableHeader><TableRow><TableHead>From</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Received</TableHead></TableRow></TableHeader>
            <TableBody>
              {(emails ?? []).map(e => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs text-muted-foreground">{e.from_address}</TableCell>
                  <TableCell className="font-medium">{e.subject}</TableCell>
                  <TableCell>{e.parsed_status && <Badge variant="outline">{e.parsed_status}</Badge>}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(e.received_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
