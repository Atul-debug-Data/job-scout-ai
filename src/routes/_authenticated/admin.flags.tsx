import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminListFlags, adminSetFlag } from "@/lib/admin.functions";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/flags")({
  head: () => ({ meta: [{ title: "Feature Flags — Admin" }] }),
  component: AdminFlagsPage,
});

function AdminFlagsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListFlags);
  const setFn = useServerFn(adminSetFlag);
  const { data, isLoading } = useQuery({ queryKey: ["admin-flags"], queryFn: () => listFn() });
  const toggle = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) => setFn({ data: { key, enabled } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-flags"] }); toast.success("Updated"); },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Feature Flags</h1>
      <div className="rounded-2xl border border-border/60 bg-card divide-y divide-border/40">
        {isLoading ? <Skeleton className="h-12 m-4" /> : (data ?? []).map(f => (
          <div key={f.key} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{f.key}</p>
              <p className="text-xs text-muted-foreground">Updated {new Date(f.updated_at).toLocaleDateString()}</p>
            </div>
            <Switch checked={f.enabled} onCheckedChange={(v) => toggle.mutate({ key: f.key, enabled: v })} />
          </div>
        ))}
      </div>
    </div>
  );
}
