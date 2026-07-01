import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ApplyTrack — Never Lose Track of a Job Again" },
      { name: "description", content: "ApplyTrack helps you organize every job application — interviews, rejections, offers — all in one place." },
    ],
  }),
  component: LandingPage,
});

const BLUE = "#0A66C2";
const BLUE_DARK = "#004182";
const BLUE_LIGHT = "#EBF3FB";
const BG = "#F3F2EF";
const TEXT = "#1D2226";
const MUTED = "#666666";
const BORDER = "#E0E0E0";
const GREEN = "#057642";

const sora = { fontFamily: "'Sora', sans-serif" };
const dm = { fontFamily: "'DM Sans', sans-serif" };

function LandingPage() {
  return (
    <div style={{ background: BG, color: TEXT, ...dm, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @keyframes at-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes at-fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .at-hero-left { animation: at-fadeUp .6s ease both; }
        .at-hero-visual { animation: at-fadeUp .6s ease .2s both; }
        .at-dash { animation: at-float 4s ease-in-out infinite; }
        .at-badge-1 { animation: at-float 4s ease-in-out .5s infinite; }
        .at-badge-2 { animation: at-float 4s ease-in-out 1s infinite; }
        .at-feature:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.1); border-color: ${BLUE} !important; }
        .at-feature { transition: all .2s; }
        .at-portal:hover { border-color: ${BLUE} !important; color: ${BLUE} !important; transform: translateY(-2px); }
        .at-portal { transition: all .2s; }
        .at-btn-hero:hover { background: ${BLUE_DARK} !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(10,102,194,.3); }
        .at-btn-hero { transition: all .2s; }
        .at-btn-outline:hover { border-color: ${BLUE} !important; color: ${BLUE} !important; }
        .at-btn-outline { transition: all .2s; }
        .at-btn-ghost:hover { background: ${BLUE_LIGHT}; }
        .at-btn-primary:hover { background: ${BLUE_DARK} !important; transform: translateY(-1px); }
        .at-btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.2); }
        .at-feature:nth-child(1){animation:at-fadeUp .5s ease .1s both}
        .at-feature:nth-child(2){animation:at-fadeUp .5s ease .2s both}
        .at-feature:nth-child(3){animation:at-fadeUp .5s ease .3s both}
        .at-feature:nth-child(4){animation:at-fadeUp .5s ease .4s both}
        .at-feature:nth-child(5){animation:at-fadeUp .5s ease .5s both}
        .at-feature:nth-child(6){animation:at-fadeUp .5s ease .6s both}
        @media (max-width: 768px) {
          .at-hero { grid-template-columns: 1fr !important; gap: 40px !important; padding: 48px 20px 32px !important; }
          .at-h1 { font-size: 32px !important; }
          .at-features { grid-template-columns: 1fr 1fr !important; }
          .at-steps { grid-template-columns: 1fr !important; gap: 24px !important; }
          .at-steps-line { display: none !important; }
          .at-hero-visual { order: -1; }
          .at-dash-wrap { max-width: 340px; margin: 0 auto; }
          .at-badge-1 { top: -10px !important; right: 0 !important; }
          .at-badge-2 { display: none !important; }
          .at-h2 { font-size: 26px !important; }
          .at-nav-ghost { display: none !important; }
        }
        @media (max-width: 480px) { .at-features { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, background: BLUE, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, letterSpacing: "-0.5px", fontWeight: 800, ...sora }}>AT</div>
          <span style={{ ...sora, fontWeight: 700, fontSize: 18, color: TEXT }}>ApplyTrack</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/login" className="at-btn-ghost at-nav-ghost" style={{ padding: "8px 18px", border: `1.5px solid ${BLUE}`, borderRadius: 24, color: BLUE, fontWeight: 600, fontSize: 14, background: "transparent", textDecoration: "none", ...dm }}>Log in</Link>
          <Link to="/signup" className="at-btn-primary" style={{ padding: "8px 20px", background: BLUE, borderRadius: 24, color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none", ...dm, transition: "all .2s" }}>Sign up free</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 24px 48px" }}>
        <div className="at-hero" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div className="at-hero-left">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: BLUE_LIGHT, color: BLUE, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, marginBottom: 20, letterSpacing: ".3px" }}>
              <span style={{ fontSize: 14 }}>✦</span> AI-powered job tracking
            </div>
            <h1 className="at-h1" style={{ ...sora, fontSize: 44, fontWeight: 800, lineHeight: 1.1, color: TEXT, marginBottom: 20, letterSpacing: "-1px" }}>
              Track every job.<br />
              <span style={{ color: BLUE }}>Never miss</span> a follow-up.
            </h1>
            <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.6, marginBottom: 32 }}>
              Organize every application in one place — track statuses, prep for interviews, and manage resumes. Built for India's job seekers.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/signup" className="at-btn-hero" style={{ padding: "14px 28px", background: BLUE, color: "#fff", borderRadius: 28, fontSize: 15, fontWeight: 600, textDecoration: "none", ...dm }}>Get Started Free →</Link>
              <a href="#how" className="at-btn-outline" style={{ padding: "14px 28px", background: "transparent", color: TEXT, border: `1.5px solid ${BORDER}`, borderRadius: 28, fontSize: 15, fontWeight: 500, textDecoration: "none", ...dm }}>See how it works</a>
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 36, paddingTop: 28, borderTop: `1px solid ${BORDER}`, flexWrap: "wrap" }}>
              {["Application Tracking", "Interview Prep", "Resume Management", "Gmail Sync (Coming Soon)"].map((l) => (
                <div key={l} style={{ fontSize: 13, color: MUTED, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: GREEN, fontWeight: 700 }}>✓</span> {l}
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard mock */}
          <div className="at-hero-visual" style={{ position: "relative" }}>
            <div className="at-badge-1" style={{ position: "absolute", top: -20, right: -20, background: "#fff", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.12)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${BORDER}`, color: GREEN, zIndex: 2 }}>
              <span style={{ fontSize: 16 }}>✉️</span> Gmail synced
            </div>
            <div className="at-dash-wrap">
              <div className="at-dash" style={{ background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.12)", overflow: "hidden", border: `1px solid ${BORDER}` }}>
                <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28CA41" }} />
                  <span style={{ fontSize: 11, color: MUTED, marginLeft: 8, ...sora, fontWeight: 600 }}>ApplyTrack Dashboard</span>
                </div>
                <div style={{ display: "flex", height: 300 }}>
                  <div style={{ width: 140, background: "#fff", borderRight: `1px solid ${BORDER}`, padding: "16px 0", flexShrink: 0 }}>
                    {["Dashboard", "Applications", "Pipeline", "Interview", "Resumes", "Settings"].map((n, i) => (
                      <div key={n} style={{ padding: "8px 16px", fontSize: 11, color: i === 0 ? BLUE : MUTED, display: "flex", alignItems: "center", gap: 8, background: i === 0 ? BLUE_LIGHT : "transparent", borderLeft: i === 0 ? `3px solid ${BLUE}` : "3px solid transparent", fontWeight: i === 0 ? 600 : 400 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
                        {n}
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1, padding: 16, background: BG, overflow: "hidden" }}>
                    <div style={{ ...sora, fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 12 }}>Your job search at a glance</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                      {[["Applied", "0", BLUE], ["Interview", "0", "#9333EA"], ["Offer", "0", GREEN], ["Rejected", "0", "#CC1016"]].map(([l, n, c]) => (
                        <div key={l} style={{ background: "#fff", borderRadius: 8, padding: 10, border: `1px solid ${BORDER}` }}>
                          <div style={{ fontSize: 9, color: MUTED, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".5px" }}>{l}</div>
                          <div style={{ ...sora, fontSize: 20, fontWeight: 800, color: c }}>{n}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#fff", borderRadius: 8, padding: 10, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Recent Activity</div>
                      <div style={{ fontSize: 9, color: MUTED, padding: "8px 0", textAlign: "center" }}>
                        Connect Gmail to auto-sync your applications
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="at-badge-2" style={{ position: "absolute", bottom: 20, left: -30, background: "#fff", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.12)", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${BORDER}`, color: BLUE, zIndex: 2 }}>
              <span style={{ fontSize: 16 }}>🔗</span> Auto-tracked
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: BORDER, maxWidth: 1100, margin: "0 auto" }} />

      {/* PORTALS */}
      <section style={{ textAlign: "center", padding: "40px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontSize: 13, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 20 }}>Works with your favourite job portals</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {["🔷 LinkedIn", "🟠 Naukri", "🟢 Internshala", "🔵 Indeed", "⚫ AngelList", "🟣 Wellfound"].map(p => (
            <div key={p} className="at-portal" style={{ background: "#fff", border: `1.5px solid ${BORDER}`, borderRadius: 24, padding: "10px 20px", fontSize: 14, fontWeight: 600, color: TEXT, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 12px rgba(0,0,0,.08)" }}>{p}</div>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: BORDER, maxWidth: 1100, margin: "0 auto" }} />

      {/* FEATURES */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>Features</div>
        <h2 className="at-h2" style={{ ...sora, fontSize: 32, fontWeight: 800, color: TEXT, marginBottom: 12, letterSpacing: "-.5px", lineHeight: 1.2 }}>Everything a job seeker needs</h2>
        <p style={{ fontSize: 16, color: MUTED, maxWidth: 500, lineHeight: 1.6, marginBottom: 48 }}>Stop juggling spreadsheets. ApplyTrack brings all your applications together automatically.</p>
        <div className="at-features" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            ["📊", "Visual Pipeline", "See every application in a Kanban board. Applied → In Review → Interview → Offer. Know exactly where you stand."],
            ["🤖", "AI Interview Prep", "Get 10 tailored interview questions for every company and role. Practice answers and get instant AI feedback."],
            ["📄", "Resume Manager", "Upload your resume and get an AI score with improvement tips. Track which resume was used for which job."],
            ["🔔", "Smart Reminders", "Never miss a follow-up. Get notified when it's time to follow up or when an interview is coming up."],
            ["📈", "Application Analytics", "See your response rates, interview conversion, and which portals work best for your profile."],
            ["🎯", "Stay Organized", "All your job applications in one place. No more spreadsheets or lost email threads."],
          ].map(([icon, title, desc]) => (
            <div key={title} className="at-feature" style={{ background: "#fff", borderRadius: 12, padding: 28, border: `1px solid ${BORDER}`, boxShadow: "0 2px 12px rgba(0,0,0,.08)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: BLUE_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{icon}</div>
              <div style={{ ...sora, fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div id="how" style={{ background: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12, textAlign: "center" }}>How it works</div>
          <h2 className="at-h2" style={{ ...sora, fontSize: 32, fontWeight: 800, color: TEXT, marginBottom: 12, letterSpacing: "-.5px", lineHeight: 1.2, textAlign: "center" }}>Up and running in 3 steps</h2>
          <p style={{ fontSize: 16, color: MUTED, maxWidth: 500, lineHeight: 1.6, margin: "0 auto 48px", textAlign: "center" }}>No complicated setup. Just sign up, add your applications, and start tracking.</p>
          <div className="at-steps" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, position: "relative" }}>
            <div className="at-steps-line" style={{ content: '""', position: "absolute", top: 28, left: "15%", right: "15%", height: 2, background: `linear-gradient(90deg, ${BLUE_LIGHT}, ${BLUE}, ${BLUE_LIGHT})`, zIndex: 0 }} />
            {[
              ["1", "Sign up free", "Create your account with email or Google. Takes less than 30 seconds."],
              ["2", "Add your applications", "Manually add jobs or import them. Organize by status and company."],
              ["3", "Track & prepare", "See all your applications, prep for interviews, and never miss a follow-up."],
            ].map(([n, t, d]) => (
              <div key={n} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: BLUE, color: "#fff", ...sora, fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 4px 16px rgba(10,102,194,.3)" }}>{n}</div>
                <div style={{ ...sora, fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{t}</div>
                <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <div style={{ background: BLUE, padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 className="at-h2" style={{ ...sora, color: "#fff", fontSize: 36, fontWeight: 800, letterSpacing: "-.5px", lineHeight: 1.2 }}>Start tracking your job search today</h2>
          <p style={{ color: "rgba(255,255,255,.8)", fontSize: 17, marginBottom: 32, marginTop: 12 }}>Free forever for the basics. No credit card required. Built for India's job seekers.</p>
          <Link to="/signup" className="at-btn-white" style={{ background: "#fff", color: BLUE, padding: "14px 36px", borderRadius: 28, fontSize: 15, fontWeight: 700, textDecoration: "none", display: "inline-block", ...dm, transition: "all .2s" }}>Get Started Free →</Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: TEXT, color: "rgba(255,255,255,.6)", textAlign: "center", padding: "28px 24px", fontSize: 13 }}>
        <strong style={{ color: "#fff" }}>ApplyTrack</strong> · Built for India's job seekers · © 2026
      </footer>
    </div>
  );
}
