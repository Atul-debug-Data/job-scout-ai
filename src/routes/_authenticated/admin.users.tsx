import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListUsers } from "@/lib/admin.functions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const fn = useServerFn(adminListUsers);
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => fn() });
  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="font-display text-3xl font-semibold">Users</h1>
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Roles</TableHead><TableHead>Jobs</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5}><Skeleton className="h-8" /></TableCell></TableRow> :
              (data ?? []).map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.roles.map(r => <Badge key={r} variant="outline" className="mr-1">{r}</Badge>)}</TableCell>
                  <TableCell>{u.job_count}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
