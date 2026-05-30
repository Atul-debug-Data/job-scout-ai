import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListLogs } from "@/lib/admin.functions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/logs")({
  head: () => ({ meta: [{ title: "Activity Logs — Admin" }] }),
  component: AdminLogsPage,
});

function AdminLogsPage() {
  const fn = useServerFn(adminListLogs);
  const { data, isLoading } = useQuery({ queryKey: ["admin-logs"], queryFn: () => fn() });
  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="font-display text-3xl font-semibold">Activity Logs</h1>
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>When</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Metadata</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4}><Skeleton className="h-8" /></TableCell></TableRow> :
              (data ?? []).map(l => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-mono">{l.user_id?.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{l.action}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-xs">{JSON.stringify(l.metadata)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
