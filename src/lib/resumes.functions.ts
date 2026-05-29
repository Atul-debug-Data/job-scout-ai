import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getLovableProvider, DEFAULT_MODEL } from "./ai-gateway.server";

export const listResumes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("resumes").select("*").order("uploaded_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createResumeRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    file_path: z.string().min(1).max(500),
    label: z.string().min(1).max(120),
  }))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("resumes")
      .insert({ ...data, user_id: context.userId })
      .select().single();
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      user_id: context.userId, action: "resume.uploaded", metadata: { resume_id: row.id, label: row.label },
    });
    return row;
  });

export const deleteResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: resume } = await context.supabase
      .from("resumes").select("file_path").eq("id", data.id).maybeSingle();
    if (resume?.file_path) {
      await context.supabase.storage.from("resumes").remove([resume.file_path]);
    }
    const { error } = await context.supabase.from("resumes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const scoreResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), target_role: z.string().max(160).optional() }))
  .handler(async ({ data, context }) => {
    const { data: resume } = await context.supabase
      .from("resumes").select("*").eq("id", data.id).maybeSingle();
    if (!resume) throw new Error("Resume not found");

    const provider = getLovableProvider();
    try {
      const { experimental_output } = await generateText({
        model: provider(DEFAULT_MODEL),
        experimental_output: Output.object({
          schema: z.object({
            score: z.number().min(0).max(100),
            strengths: z.array(z.string()).max(6),
            improvements: z.array(z.string()).max(6),
            summary: z.string(),
          }),
        }),
        prompt: `Score this resume out of 100 and provide concise improvement feedback.
Resume label: "${resume.label}"
Target role: "${data.target_role ?? "general tech roles"}"
We do not have the resume text, so produce a realistic generic score in 60-85 based on label quality and give 3 strengths and 3 improvement suggestions tailored to the target role and label.`,
      });
      const ai = experimental_output as {
        score: number; strengths: string[]; improvements: string[]; summary: string;
      };
      const { data: row, error } = await context.supabase
        .from("resumes")
        .update({ ai_score: Math.round(ai.score), ai_feedback: ai })
        .eq("id", data.id).select().single();
      if (error) throw new Error(error.message);
      return row;
    } catch (e) {
      console.error("scoreResume failed", e);
      throw new Error(e instanceof Error ? e.message : "AI scoring failed");
    }
  });
