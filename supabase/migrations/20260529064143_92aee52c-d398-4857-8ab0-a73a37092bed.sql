
-- Enums
create type public.app_role as enum ('admin', 'user');
create type public.job_status as enum ('applied', 'in_review', 'interview', 'offer', 'rejected');
create type public.job_source as enum ('manual', 'gmail');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "admins read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- Jobs
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  title text not null,
  portal text,
  location text,
  status public.job_status not null default 'applied',
  applied_date date not null default current_date,
  source public.job_source not null default 'manual',
  resume_id uuid,
  notes text,
  last_activity timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.jobs to authenticated;
grant all on public.jobs to service_role;
alter table public.jobs enable row level security;
create policy "users crud own jobs" on public.jobs for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admins read all jobs" on public.jobs for select to authenticated using (public.has_role(auth.uid(),'admin'));
create index jobs_user_idx on public.jobs(user_id);
create index jobs_status_idx on public.jobs(status);

-- Emails
create table public.emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  subject text not null,
  snippet text,
  from_address text,
  received_at timestamptz not null default now(),
  parsed_status public.job_status,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.emails to authenticated;
grant all on public.emails to service_role;
alter table public.emails enable row level security;
create policy "users crud own emails" on public.emails for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admins read all emails" on public.emails for select to authenticated using (public.has_role(auth.uid(),'admin'));
create index emails_user_idx on public.emails(user_id);
create index emails_job_idx on public.emails(job_id);

-- Gmail tokens
create table public.gmail_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_token text,
  refresh_token text,
  expiry timestamptz,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz
);
grant select, insert, update, delete on public.gmail_tokens to authenticated;
grant all on public.gmail_tokens to service_role;
alter table public.gmail_tokens enable row level security;
create policy "users crud own gmail token" on public.gmail_tokens for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Resumes
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_path text not null,
  label text not null,
  ai_score int,
  ai_feedback jsonb,
  uploaded_at timestamptz not null default now()
);
grant select, insert, update, delete on public.resumes to authenticated;
grant all on public.resumes to service_role;
alter table public.resumes enable row level security;
create policy "users crud own resumes" on public.resumes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admins read all resumes" on public.resumes for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- FK now possible
alter table public.jobs add constraint jobs_resume_fk foreign key (resume_id) references public.resumes(id) on delete set null;

-- Interview sessions
create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  questions jsonb not null default '[]'::jsonb,
  answers jsonb not null default '[]'::jsonb,
  feedback jsonb not null default '[]'::jsonb,
  company_summary text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.interview_sessions to authenticated;
grant all on public.interview_sessions to service_role;
alter table public.interview_sessions enable row level security;
create policy "users crud own sessions" on public.interview_sessions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admins read all sessions" on public.interview_sessions for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- Activity logs
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.activity_logs to authenticated;
grant all on public.activity_logs to service_role;
alter table public.activity_logs enable row level security;
create policy "users read own activity" on public.activity_logs for select to authenticated using (auth.uid() = user_id);
create policy "users insert own activity" on public.activity_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "admins read all activity" on public.activity_logs for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- Feature flags
create table public.feature_flags (
  key text primary key,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select on public.feature_flags to authenticated, anon;
grant all on public.feature_flags to service_role;
alter table public.feature_flags enable row level security;
create policy "anyone read flags" on public.feature_flags for select to authenticated, anon using (true);
create policy "admins update flags" on public.feature_flags for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins insert flags" on public.feature_flags for insert to authenticated with check (public.has_role(auth.uid(),'admin'));

insert into public.feature_flags(key, enabled) values ('gmail_sync', true), ('ai_interview', true);

-- Auto-create profile + default user role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Storage bucket for resumes (private)
insert into storage.buckets (id, name, public) values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "users read own resume files" on storage.objects for select to authenticated
using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users upload own resume files" on storage.objects for insert to authenticated
with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users delete own resume files" on storage.objects for delete to authenticated
using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
