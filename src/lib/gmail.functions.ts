import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MOCK_EMAILS = [
  { company: "Google", title: "Software Engineer L4", portal: "LinkedIn", subject: "Your application to Google has been received", status: "applied" as const, days_ago: 12 },
  { company: "Google", title: "Software Engineer L4", portal: "LinkedIn", subject: "Next steps — phone screen with Google", status: "interview" as const, days_ago: 5 },
  { company: "Stripe", title: "Senior Product Engineer", portal: "Stripe Careers", subject: "Application received — Stripe", status: "applied" as const, days_ago: 18 },
  { company: "Stripe", title: "Senior Product Engineer", portal: "Stripe Careers", subject: "Update on your Stripe application", status: "in_review" as const, days_ago: 9 },
  { company: "Netflix", title: "Frontend Engineer", portal: "Indeed", subject: "Unfortunately we won't be moving forward", status: "rejected" as const, days_ago: 22 },
  { company: "Linear", title: "Full-stack Engineer", portal: "Y Combinator Jobs", subject: "We'd love to schedule an interview", status: "interview" as const, days_ago: 3 },
  { company: "Notion", title: "Product Designer (Eng)", portal: "Notion Careers", subject: "Your application to Notion", status: "applied" as const, days_ago: 7 },
  { company: "Vercel", title: "Developer Advocate", portal: "Vercel Careers", subject: "Offer letter — Vercel", status: "offer" as const, days_ago: 1 },
  { company: "Airbnb", title: "Mobile Engineer", portal: "LinkedIn", subject: "Application received at Airbnb", status: "applied" as const, days_ago: 14 },
  { company: "Shopify", title: "Backend Engineer", portal: "Shopify Careers", subject: "Interview invitation — Shopify", status: "interview" as const, days_ago: 4 },
];

export const getSyncStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: token } = await context.supabase
      .from("gmail_tokens").select("*").eq("user_id", context.userId).maybeSingle();
    const { count: emailCount } = await context.supabase
      .from("emails").select("*", { count: "exact", head: true });
    return {
      connected: !!token,
      connected_at: token?.connected_at ?? null,
      last_synced_at: token?.last_synced_at ?? null,
      email_count: emailCount ?? 0,
    };
  });

export const connectGmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("gmail_tokens")
      .upsert({
        user_id: context.userId,
        access_token: "mock_access_token",
        refresh_token: "mock_refresh_token",
        expiry: new Date(Date.now() + 3600 * 1000).toISOString(),
        connected_at: new Date().toISOString(),
      });
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      user_id: context.userId, action: "gmail.connected", metadata: {},
    });
    return { ok: true };
  });

export const disconnectGmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase.from("gmail_tokens").delete().eq("user_id", context.userId);
    return { ok: true };
  });

export const syncGmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: token } = await context.supabase
      .from("gmail_tokens").select("user_id").eq("user_id", context.userId).maybeSingle();
    if (!token) throw new Error("Gmail not connected");

    let createdJobs = 0;
    let updatedJobs = 0;
    let insertedEmails = 0;

    // Group by (company, title)
    const groups = new Map<string, typeof MOCK_EMAILS>();
    for (const e of MOCK_EMAILS) {
      const k = `${e.company}__${e.title}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(e);
    }

    for (const [, events] of groups) {
      // pick latest status
      const sorted = [...events].sort((a, b) => a.days_ago - b.days_ago);
      const latest = sorted[0];
      const earliest = sorted[sorted.length - 1];

      const { data: existing } = await context.supabase
        .from("jobs")
        .select("id")
        .eq("user_id", context.userId)
        .eq("company", latest.company)
        .eq("title", latest.title)
        .maybeSingle();

      let jobId: string;
      const appliedDate = new Date(Date.now() - earliest.days_ago * 86400_000).toISOString().slice(0, 10);

      if (existing) {
        const { data: upd } = await context.supabase.from("jobs").update({
          status: latest.status,
          last_activity: new Date().toISOString(),
        }).eq("id", existing.id).select("id").single();
        jobId = upd!.id;
        updatedJobs++;
      } else {
        const { data: ins, error } = await context.supabase.from("jobs").insert({
          user_id: context.userId,
          company: latest.company,
          title: latest.title,
          portal: latest.portal,
          status: latest.status,
          applied_date: appliedDate,
          source: "gmail",
        }).select("id").single();
        if (error) throw new Error(error.message);
        jobId = ins!.id;
        createdJobs++;
      }

      for (const e of events) {
        const receivedAt = new Date(Date.now() - e.days_ago * 86400_000).toISOString();
        const { data: existsEmail } = await context.supabase
          .from("emails").select("id")
          .eq("user_id", context.userId).eq("subject", e.subject).eq("job_id", jobId).maybeSingle();
        if (!existsEmail) {
          await context.supabase.from("emails").insert({
            user_id: context.userId,
            job_id: jobId,
            subject: e.subject,
            snippet: `Auto-parsed from Gmail: ${e.subject}`,
            from_address: `careers@${e.company.toLowerCase().replace(/\s+/g, "")}.com`,
            received_at: receivedAt,
            parsed_status: e.status,
          });
          insertedEmails++;
        }
      }
    }

    await context.supabase.from("gmail_tokens").update({
      last_synced_at: new Date().toISOString(),
    }).eq("user_id", context.userId);

    await context.supabase.from("activity_logs").insert({
      user_id: context.userId, action: "gmail.synced",
      metadata: { created: createdJobs, updated: updatedJobs, emails: insertedEmails },
    });

    return { createdJobs, updatedJobs, insertedEmails };
  });

export const listEmails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("emails").select("*").order("received_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
