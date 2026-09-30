import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const features = [
  "High-performance Turbopack build system",
  "Accessible and customizable shadcn UI components",
  "Role-based access control & security auditing",
];

const customerAvatars = ["Alex", "Sarah", "David", "Emma"];

export function AuthShowcase() {
  return (
    <div className="hidden flex-col justify-between overflow-hidden border-r border-zinc-800 bg-zinc-950 p-12 text-zinc-50 lg:relative lg:flex">
      {/* Background decorative glow */}
      <div className="bg-primary/20 pointer-events-none absolute top-1/4 -right-24 h-96 w-96 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Top Tagline */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/80 px-3 py-1 text-xs font-medium text-zinc-300">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Modern Enterprise Boilerplate
        </span>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 my-auto max-w-lg space-y-6">
        <h2 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
          Streamlined management for modern teams.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          Experience lightning-fast development, scalable component
          architecture, and enterprise-grade security controls built on Next.js
          16 and Tailwind CSS v4.
        </p>

        {/* Feature Highlights */}
        <div className="grid gap-3 pt-2">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2.5 text-xs text-zinc-300"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Social Proof Card */}
        <div className="mt-8 space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {customerAvatars.map((name) => (
                <Avatar key={name} className="h-7 w-7 border-2 border-zinc-950">
                  <AvatarFallback className="bg-zinc-800 text-[10px] text-zinc-200">
                    {name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>SOC2 Compliant</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 italic">
            &ldquo;This boilerplate saved our team weeks of engineering setup.
            The modern UI and clean structure make scaling effortless.&rdquo;
          </p>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500">
        <span>Powered by Next.js 16 & Turbopack</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          All systems operational
        </span>
      </div>
    </div>
  );
}
