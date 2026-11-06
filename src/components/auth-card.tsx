import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
  wide = false,
  eyebrow = "Acceso a NEXUS FF",
}: {
  title: string;
  description: string;
  children: ReactNode;
  wide?: boolean;
  eyebrow?: string;
}) {
  return (
    <div className={`w-full ${wide ? "max-w-xl" : "max-w-[460px]"}`}>
      <div className="mb-6">
        <p className="kicker">{eyebrow}</p>
        <h1 className="display mt-3 text-[clamp(2.35rem,5vw,3.4rem)]">{title}</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-muted md:text-sm">
          {description}
        </p>
      </div>

      <div className="auth-card">{children}</div>

      <div className="mono mt-5 flex flex-wrap items-center justify-between gap-2 text-[8px] uppercase tracking-[0.1em] text-[#6f6368]">
        <span>NEXUS FF · Plataforma de torneos</span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(112,217,164,0.6)]"
            aria-hidden="true"
          />
          Argentina
        </span>
      </div>
    </div>
  );
}
