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
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-card">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">in</div>
            <span className="font-semibold text-lg text-foreground">ApplyTrack</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" className="rounded-full font-semibold text-foreground">Sign in</Button></Link>
            <Link to="/signup"><Button className="rounded-full font-semibold">Join now</Button></Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-card border-b border-border">
        <div className="absolute inset-0 gradient-hero pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-foreground">
              Track every job.<br />
              <span className="text-primary">Never miss a follow-up.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              ApplyTrack syncs with Gmail, organizes your pipeline, and uses AI to help you ace every interview.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/signup"><Button size="lg" className="rounded-full font-semibold">Get started free <ArrowRight className="size-4" /></Button></Link>
              <Link to="/login"><Button size="lg" variant="outline" className="rounded-full font-semibold border-primary text-primary hover:bg-secondary">Sign in</Button></Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-lg border border-border bg-card p-5 shadow-lift">
              <div className="flex items-center justify-between mb-4">
                <p className="label-uppercase">Recent applications</p>
                <span className="text-xs font-semibold text-primary">Live sync</span>
              </div>
              <div className="space-y-2">
                {[
                  { c: "Stripe", t: "Senior Product Engineer", s: "Interview", color: "bg-[#F0EAFF] text-[#6E3FE7]" },
                  { c: "Linear", t: "Full-stack Engineer", s: "In review", color: "bg-[#FFF4E5] text-[#B24020]" },
                  { c: "Vercel", t: "Developer Advocate", s: "Offer", color: "bg-[#E6F4EC] text-success" },
                ].map((j, i) => (
                  <motion.div
                    key={j.c}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 rounded-md border border-border bg-background p-3 hover-lift"
                  >
                    <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">{j.c[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{j.c}</p>
                      <p className="text-xs text-muted-foreground">{j.t}</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${j.color}`}>{j.s}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-center text-foreground">Everything you need to land the job</h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { Icon: Mail, t: "Gmail Sync", d: "Auto-parse application emails and updates." },
            { Icon: Sparkles, t: "AI Interview Prep", d: "Generated questions and instant feedback." },
            { Icon: FileText, t: "Resume Manager", d: "Upload, score, and tag resumes per role." },
            { Icon: LayoutDashboard, t: "Smart Dashboard", d: "Pipeline, stats, and follow-up reminders." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="rounded-lg border border-border bg-card p-6 shadow-card hover-lift">
              <div className="size-10 rounded-lg bg-secondary text-primary flex items-center justify-center">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-center text-foreground">How it works</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {[
            { n: "01", t: "Connect Gmail", d: "One-click sync pulls your application emails." },
            { n: "02", t: "Auto-track", d: "We organize every job into a smart pipeline." },
            { n: "03", t: "Ace Interviews", d: "AI prep tailored to each company." },
          ].map((s) => (
            <div key={s.n} className="relative rounded-lg border border-border bg-card p-6 shadow-card">
              <span className="font-display text-5xl font-semibold text-primary/30">{s.n}</span>
              <h3 className="mt-2 font-semibold text-lg text-foreground">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              <CheckCircle2 className="absolute top-6 right-6 size-5 text-primary" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="rounded-lg border border-border bg-card p-12 shadow-card">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">Ready to land your next role?</h2>
          <p className="mt-3 text-muted-foreground">Join ApplyTrack free. No credit card required.</p>
          <Link to="/signup" className="mt-6 inline-block"><Button size="lg" className="rounded-full font-semibold">Get started free <ArrowRight className="size-4" /></Button></Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ApplyTrack</p>
          <p>Built for job seekers</p>
        </div>
      </footer>
    </div>
  );
}
