import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const StatusEnum = z.enum(["applied", "in_review", "interview", "offer", "rejected"]);

export const listJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("jobs")
      .select("*")
      .order("last_activity", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: job, error } = await context.supabase
      .from("jobs").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!job) throw new Error("Job not found");
    const { data: emails } = await context.supabase
      .from("emails").select("*").eq("job_id", data.id).order("received_at", { ascending: false });
    return { job, emails: emails ?? [] };
  });

export const createJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    company: z.string().min(1).max(120),
    title: z.string().min(1).max(160),
    portal: z.string().max(60).optional(),
    location: z.string().max(120).optional(),
    status: StatusEnum.default("applied"),
    applied_date: z.string().optional(),
    notes: z.string().max(2000).optional(),
    resume_id: z.string().uuid().optional(),
  }))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("jobs")
      .insert({ ...data, user_id: context.userId, source: "manual" })
      .select().single();
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      user_id: context.userId, action: "job.created", metadata: { job_id: row.id, company: row.company },
    });
    return row;
  });

export const updateJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(),
    company: z.string().min(1).max(120).optional(),
    title: z.string().min(1).max(160).optional(),
    portal: z.string().max(60).nullable().optional(),
    location: z.string().max(120).nullable().optional(),
    status: StatusEnum.optional(),
    applied_date: z.string().optional(),
    notes: z.string().max(2000).nullable().optional(),
    resume_id: z.string().uuid().nullable().optional(),
  }))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { data: row, error } = await context.supabase
      .from("jobs").update({ ...rest, last_activity: new Date().toISOString() })
      .eq("id", id).select().single();
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      user_id: context.userId, action: "job.updated", metadata: { job_id: id, changes: rest },
    });
    return row;
  });

export const deleteJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("jobs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      user_id: context.userId, action: "job.deleted", metadata: { job_id: data.id },
    });
    return { ok: true };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: jobs } = await context.supabase.from("jobs").select("*");
    const list = jobs ?? [];
    const counts = {
      applied: list.filter(j => j.status === "applied").length,
      in_review: list.filter(j => j.status === "in_review").length,
      interview: list.filter(j => j.status === "interview").length,
      offer: list.filter(j => j.status === "offer").length,
      rejected: list.filter(j => j.status === "rejected").length,
      total: list.length,
    };
    const { data: activity } = await context.supabase
      .from("activity_logs").select("*").order("created_at", { ascending: false }).limit(8);
    return { counts, jobs: list, activity: activity ?? [] };
  });
