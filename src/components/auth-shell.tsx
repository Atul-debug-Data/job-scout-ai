import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string; subtitle?: string; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero pointer-events-none" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="size-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold">in</div>
          <span className="text-2xl font-semibold text-foreground">ApplyTrack</span>
        </Link>
        <div className="rounded-lg border border-border bg-card p-8 shadow-card">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
