import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const [users, jobs, sessions, resumes, weekActive] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("jobs").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("interview_sessions").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("resumes").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("activity_logs")
        .select("user_id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 86400_000).toISOString()),
    ]);
    return {
      total_users: users.count ?? 0,
      total_jobs: jobs.count ?? 0,
      total_sessions: sessions.count ?? 0,
      total_resumes: resumes.count ?? 0,
      active_this_week: weekActive.count ?? 0,
    };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("*");
    const { data: jobs } = await supabaseAdmin.from("jobs").select("user_id");
    const jobCounts = new Map<string, number>();
    (jobs ?? []).forEach(j => jobCounts.set(j.user_id, (jobCounts.get(j.user_id) ?? 0) + 1));
    return (profiles ?? []).map(p => ({
      ...p,
      roles: (roles ?? []).filter(r => r.user_id === p.id).map(r => r.role),
      job_count: jobCounts.get(p.id) ?? 0,
    }));
  });

export const adminListLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("activity_logs").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListEmails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("emails").select("*").order("received_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("feature_flags").select("*").order("key");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSetFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ key: z.string().min(1).max(60), enabled: z.boolean() }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("feature_flags").upsert({ key: data.key, enabled: data.enabled, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    return { is_admin: !!data };
  });
