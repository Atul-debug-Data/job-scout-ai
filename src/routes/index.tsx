import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles, FileText, LayoutDashboard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ApplyTrack — Track every job. Never miss a follow-up." },
      { name: "description", content: "Sync Gmail, track applications, and prepare for interviews with AI. Free to start." },
      { property: "og:title", content: "ApplyTrack" },
      { property: "og:description", content: "Track every job. Never miss a follow-up." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 backdrop-blur-md border-b border-border/40 bg-background/70">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg gradient-primary shadow-glow" />
            <span className="font-display text-xl font-semibold">ApplyTrack</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost">Log in</Button></Link>
            <Link to="/signup"><Button>Sign up</Button></Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3 text-primary" /> AI-powered job search
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Track every job.<br />
              <span className="text-gradient">Never miss a follow-up.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              ApplyTrack syncs with Gmail, organizes your pipeline, and uses AI to help you ace every interview.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/signup"><Button size="lg" className="shadow-glow">Get Started Free <ArrowRight className="size-4" /></Button></Link>
              <Link to="/login"><Button size="lg" variant="outline">Log in</Button></Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Recent applications</p>
                <span className="text-xs text-primary">Live sync</span>
              </div>
              <div className="space-y-3">
                {[
                  { c: "Stripe", t: "Senior Product Engineer", s: "Interview", color: "bg-primary/20 text-primary" },
                  { c: "Linear", t: "Full-stack Engineer", s: "In review", color: "bg-warning/20 text-warning" },
                  { c: "Vercel", t: "Developer Advocate", s: "Offer", color: "bg-success/20 text-success" },
                ].map((j, i) => (
                  <motion.div
                    key={j.c}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.12 }}
                    className="flex items-center justify-between rounded-xl border border-border/40 bg-background/50 p-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{j.c}</p>
                      <p className="text-xs text-muted-foreground">{j.t}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${j.color}`}>{j.s}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-center">Everything you need to land the job</h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { Icon: Mail, t: "Gmail Sync", d: "Auto-parse application emails and updates." },
            { Icon: Sparkles, t: "AI Interview Prep", d: "Generated questions and instant feedback." },
            { Icon: FileText, t: "Resume Manager", d: "Upload, score, and tag resumes per role." },
            { Icon: LayoutDashboard, t: "Smart Dashboard", d: "Pipeline, stats, and follow-up reminders." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border/60 bg-card/60 p-6 hover:border-primary/50 transition-colors">
              <Icon className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-center">How it works</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Connect Gmail", d: "One-click sync pulls your application emails." },
            { n: "02", t: "Auto-track", d: "We organize every job into a smart pipeline." },
            { n: "03", t: "Ace Interviews", d: "AI prep tailored to each company." },
          ].map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border/60 bg-card/60 p-6">
              <span className="font-display text-5xl text-primary/40">{s.n}</span>
              <h3 className="mt-2 font-semibold text-lg">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              <CheckCircle2 className="absolute top-6 right-6 size-5 text-primary/60" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="rounded-3xl border border-border/60 bg-card/60 p-12 shadow-card">
          <h2 className="font-display text-3xl md:text-4xl font-semibold">Ready to land your next role?</h2>
          <p className="mt-3 text-muted-foreground">Join ApplyTrack free. No credit card required.</p>
          <Link to="/signup" className="mt-6 inline-block"><Button size="lg" className="shadow-glow">Get Started Free <ArrowRight className="size-4" /></Button></Link>
        </div>
      </section>

      <footer className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ApplyTrack</p>
          <p>Built with ❤️ for job seekers</p>
        </div>
      </footer>
    </div>
  );
}
