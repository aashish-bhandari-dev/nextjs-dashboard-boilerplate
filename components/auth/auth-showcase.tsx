import {
  Activity,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";

const adminHighlights = [
  "Role-Based Access Control (RBAC) & Scopes",
  "User & Account Lifecycle Management",
  "Real-Time Activity Auditing & Compliance Logs",
  "Automated Security Lockout Protection",
];

export function AuthShowcase() {
  return (
    <div className="hidden h-full flex-col justify-between overflow-hidden border-r border-zinc-800 bg-zinc-950 p-8 xl:p-10 text-zinc-50 lg:relative lg:flex">
      {/* Background ambient lighting */}
      <div className="bg-primary/15 pointer-events-none absolute top-1/4 -right-24 h-80 w-80 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Top Tagline */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1 text-xs font-medium text-zinc-300">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Enterprise Administration Console
        </span>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 my-auto max-w-md space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 leading-snug">
          Centralized governance, operations, and access control.
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
          Secure management portal for authorized operators. Oversee system configurations, monitor
          platform health, and enforce security policies across all services.
        </p>

        {/* Feature Highlights */}
        <div className="grid gap-2.5 pt-1">
          {adminHighlights.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 text-xs text-zinc-300 font-medium"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Security & Compliance Panel */}
        <div className="mt-4 space-y-2 rounded-lg border border-zinc-800/80 bg-zinc-900/70 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
              <LockKeyhole className="h-3.5 w-3.5 text-primary" />
              <span>Restricted Access</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
              <Activity className="h-2.5 w-2.5" />
              <span>SUPER_ADMIN & ADMIN</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            All administrative actions, configuration adjustments, and user state modifications
            are recorded in immutable audit logs.
          </p>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-500 pt-2">
        <span className="flex items-center gap-1.5">
          <Users className="h-3 w-3 text-zinc-400" />
          <span>AdminHub Infrastructure</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span>Systems operational</span>
        </span>
      </div>
    </div>
  );
}
