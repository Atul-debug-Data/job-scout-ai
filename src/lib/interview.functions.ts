import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getLovableProvider, DEFAULT_MODEL } from "./ai-gateway.server";

export const listSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("interview_sessions").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("interview_sessions").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Session not found");
    return row;
  });

export const generateQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ job_id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: job } = await context.supabase
      .from("jobs").select("*").eq("id", data.job_id).maybeSingle();
    if (!job) throw new Error("Job not found");

    const provider = getLovableProvider();
    const { experimental_output } = await generateText({
      model: provider(DEFAULT_MODEL),
      experimental_output: Output.object({
        schema: z.object({
          company_summary: z.string().max(500),
          questions: z.array(z.object({
            question: z.string(),
            tip: z.string(),
          })).length(10),
        }),
      }),
      prompt: `Generate 10 likely interview questions for a candidate interviewing at "${job.company}" for the role "${job.title}".
Include a mix of behavioral, technical, and role-specific questions. For each question, add a concise tip (1-2 sentences) on how to answer.
Also produce a 2-3 sentence summary about ${job.company} useful for interview prep.`,
    });
    const ai = experimental_output as { company_summary: string; questions: { question: string; tip: string }[] };

    const { data: row, error } = await context.supabase
      .from("interview_sessions")
      .insert({
        user_id: context.userId,
        job_id: data.job_id,
        questions: ai.questions,
        company_summary: ai.company_summary,
      })
      .select().single();
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      user_id: context.userId, action: "interview.generated", metadata: { job_id: data.job_id, session_id: row.id },
    });
    return row;
  });

export const gradeAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    session_id: z.string().uuid(),
    question_index: z.number().int().min(0).max(20),
    answer: z.string().min(1).max(4000),
  }))
  .handler(async ({ data, context }) => {
    const { data: session } = await context.supabase
      .from("interview_sessions").select("*").eq("id", data.session_id).maybeSingle();
    if (!session) throw new Error("Session not found");
    const questions = session.questions as { question: string; tip: string }[];
    const q = questions[data.question_index];
    if (!q) throw new Error("Question not found");

    const provider = getLovableProvider();
    const { experimental_output } = await generateText({
      model: provider(DEFAULT_MODEL),
      experimental_output: Output.object({
        schema: z.object({
          score: z.number().min(0).max(10),
          strengths: z.string(),
          improvements: z.string(),
        }),
      }),
      prompt: `Question: "${q.question}"
Candidate answer: "${data.answer}"
Grade 0-10. Give one sentence of strengths and one sentence of improvements.`,
    });
    const feedback = experimental_output as { score: number; strengths: string; improvements: string };

    const answers = (session.answers as unknown[]) ?? [];
    const fbArr = (session.feedback as unknown[]) ?? [];
    answers[data.question_index] = data.answer;
    fbArr[data.question_index] = feedback;

    const { data: row, error } = await context.supabase
      .from("interview_sessions")
      .update({ answers, feedback: fbArr })
      .eq("id", data.session_id).select().single();
    if (error) throw new Error(error.message);
    return { feedback, session: row };
  });
