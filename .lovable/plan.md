## ApplyTrack — Build Plan

A full-stack job application tracker with mock Gmail sync, AI interview prep (Lovable AI / Gemini), resume manager, and admin panel.

### Stack

- TanStack Start (React 19 + Vite 7), TailwindCSS v4, shadcn/ui
- Lovable Cloud (Supabase: Auth + Postgres + Storage)
- Lovable AI Gateway (`google/gemini-3-flash-preview` default; `openai/gpt-5` for heavier prep tasks)
- Fonts: Cal Sans (display) + DM Sans (body) via Google Fonts CDN

### Design system

- Dark navy base (`oklch` deep navy), white cards, electric blue accent
- Tokens defined in `src/styles.css`: `--background`, `--card`, `--primary` (electric blue), `--accent`, `--muted`, sidebar tokens
- Skeleton loaders, subtle framer-motion page transitions, hover micro-interactions

### Database (migration)

Tables (all in `public`, with GRANTs + RLS):
- `profiles` (id → auth.users, email, name, created_at) — trigger auto-creates on signup
- `user_roles` (id, user_id, role: `app_role` enum `admin|user`) + `has_role(uuid, app_role)` SECURITY DEFINER
- `jobs` (id, user_id, company, title, portal, status enum `applied|in_review|interview|offer|rejected`, applied_date, location, source `manual|gmail`, resume_id nullable, last_activity)
- `emails` (id, user_id, job_id nullable, subject, snippet, received_at, parsed_status, raw)
- `gmail_tokens` (user_id PK, access_token, refresh_token, expiry, connected_at) — RLS owner-only, no anon
- `resumes` (id, user_id, file_path, label, ai_score nullable, ai_feedback nullable, uploaded_at)
- `interview_sessions` (id, user_id, job_id, questions jsonb, answers jsonb, feedback jsonb, created_at)
- `activity_logs` (id, user_id, action, metadata jsonb, created_at)
- Storage bucket `resumes` (private) + RLS policies scoped to `auth.uid()::text = (storage.foldername(name))[1]`

RLS: every table scoped to `auth.uid() = user_id`. Admin policies use `has_role(auth.uid(),'admin')` for read-all on user-data tables and full access on `activity_logs`.

### Server functions (`src/lib/*.functions.ts`)

- `jobs.functions.ts` — list/create/update/delete/getById (auth middleware)
- `resumes.functions.ts` — list/create-record/delete; signed upload URL; `scoreResume` (AI)
- `interview.functions.ts` — `generateQuestions(jobId)`, `gradeAnswer(sessionId, qIdx, answer)`, list sessions
- `gmail.functions.ts` — `mockSyncGmail()` seeds 5-10 fake parsed emails → creates/updates jobs, writes `emails` + `activity_logs`, returns sync summary; `getSyncStatus()`
- `admin.functions.ts` — gated by `has_role`: list users, list activity, stats, feature flags
- `feature_flags.functions.ts` — read flags (table `feature_flags(key text pk, enabled bool)`)

AI calls use the shared gateway helper in `src/lib/ai-gateway.server.ts` (per the ai-sdk-lovable-gateway pattern).

### Routes

Public:
- `/` — Landing (hero with animated job-card preview, features grid, 3-step how-it-works, CTA)
- `/login`, `/signup`, `/forgot-password`, `/reset-password`

Authenticated layout `src/routes/_authenticated.tsx` (sidebar shell):
- `/dashboard` — stats cards, Kanban pipeline, recent activity, upcoming interviews
- `/dashboard/applications` — table ⇄ Kanban toggle, filters, Add Job dialog, detail drawer with email timeline
- `/dashboard/gmail` — mock connect button, sync status, "Sync Now", parsed emails table
- `/dashboard/interview/$jobId` — generated questions list + Mock Interview chat mode with per-answer feedback
- `/dashboard/resumes` — upload (Supabase Storage), label, AI score panel, tag-to-job
- `/dashboard/settings` — profile, password change, sign out

Admin layout `src/routes/_authenticated/_admin.tsx` (gated by `has_role('admin')`, redirects to `/dashboard` otherwise):
- `/admin` — stats overview
- `/admin/users` — user table
- `/admin/logs` — activity logs + email logs tabs
- `/admin/flags` — feature flag toggles

### Auth

- Email + password via Supabase (email verification on signup, `emailRedirectTo: window.location.origin`)
- Google OAuth via Lovable broker (`lovable.auth.signInWithOAuth("google", ...)`) — also calls `configure_social_auth` for `google`
- Reset password flow with `/reset-password` page
- `_authenticated` layout: synchronous context check → redirect to `/login`
- Child `beforeLoad` on protected routes: `supabase.auth.getUser()` hydration gate
- Root `__root.tsx` registers `onAuthStateChange` once → `router.invalidate()` + `queryClient.invalidateQueries()`
- `attachSupabaseAuth` registered in `src/start.ts` functionMiddleware

### Mock Gmail (per your choice)

No Google OAuth wiring. `Connect Gmail` button flips a row in `gmail_tokens` (fake values) and triggers `mockSyncGmail` server fn which:
- Inserts 6–10 realistic fake emails (Google, Stripe, Netflix, etc.) with varied statuses
- Creates/updates matching `jobs` rows
- Writes `activity_logs` entries
Wired so swapping to real Gmail later only changes the server fn body.

### AI (Lovable AI Gateway, no key setup)

- Provision `LOVABLE_API_KEY` via `ai_gateway--create`
- `generateQuestions`: structured output (zod `{questions: [{q, tips}]}`) using `google/gemini-3-flash-preview`
- `gradeAnswer`: structured `{score, strengths, improvements}`
- `scoreResume`: PDF text extracted client-side (pdfjs-dist) → server fn returns `{score, suggestions[]}`
- Company research summary: short prompt → markdown blurb

### Data fetching

- TanStack Query already in template; use `queryOptions` + `ensureQueryData` in loaders + `useSuspenseQuery` in components
- Mutations via `useServerFn` + `useMutation` with cache invalidation

### Seeding

Migration inserts:
- `feature_flags`: `gmail_sync=true`, `ai_interview=true`
- After first admin signs up they can promote themselves via SQL (documented in chat); no auto-admin

### Out of scope (v1)

- Real Gmail OAuth + API (stubbed; swap-in path documented)
- Email parsing ML — uses keyword matching on mock data
- Billing/plans column shown as "Free" placeholder in admin
- Auto-sync cron (manual + 24h flag visible but not scheduled)

### Build order

1. Enable Lovable Cloud + provision `LOVABLE_API_KEY`
2. Migration: enums, tables, RLS, GRANTs, storage bucket, trigger, `has_role`, feature_flags seed
3. Design tokens (`styles.css`) + fonts + base shadcn theme tweaks
4. Auth pages + `_authenticated` layout + sidebar shell
5. Landing page
6. Dashboard overview + Applications (table/Kanban/drawer/Add Job)
7. Resumes (storage upload + AI score)
8. Mock Gmail page + sync server fn
9. AI Interview page (generate + mock mode)
10. Settings
11. Admin section (users/logs/flags)
12. Polish: skeletons, transitions, mobile responsive pass at 390px
