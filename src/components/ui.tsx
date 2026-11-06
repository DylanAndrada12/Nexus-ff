import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";
import {
  REGISTRATION_STATUS_LABELS,
  TOURNAMENT_STATUS_LABELS,
  type RegistrationStatus,
  type TournamentStatus,
} from "@/lib/constants";

const badgeStyles: Record<string, string> = {
  REGISTRATION_OPEN: "badge-open",
  UPCOMING: "badge-upcoming",
  FULL: "badge-pending",
  ONGOING: "badge-open",
  FINISHED: "badge-neutral",
  CANCELLED: "badge-cancelled",
  CONFIRMED: "badge-confirmed",
  REJECTED: "badge-rejected",
  PENDING: "badge-pending",
};

export function statusLabel(status: string): string {
  return (
    TOURNAMENT_STATUS_LABELS[status as TournamentStatus] ??
    REGISTRATION_STATUS_LABELS[status as RegistrationStatus] ??
    status.replaceAll("_", " ").toLowerCase()
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${badgeStyles[status] ?? "badge-neutral"}`}>
      {statusLabel(status)}
    </span>
  );
}

export function SectionHeading({
  title,
  description,
  action,
  id,
  icon,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  id?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div className="flex min-w-0 items-start gap-3">
        <span className="section-heading-icon" aria-hidden="true">
          {icon ?? <Flame size={15} strokeWidth={1.9} />}
        </span>
        <div className="min-w-0">
          <h2 id={id} className="section-title">
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-muted md:text-[13px]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? (
        <Link href={action.href} className="section-action">
          {action.label}
          <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-8 border-b border-line pb-6">
      {breadcrumb ? <div className="mb-4 text-xs text-muted">{breadcrumb}</div> : null}
      {eyebrow ? <p className="kicker mb-3">{eyebrow}</p> : null}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <h1 className="display text-[clamp(2.25rem,4.5vw,3.6rem)]">{title}</h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted md:text-sm">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  compact = false,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
  compact?: boolean;
}) {
  return (
    <div
      className={`panel relative overflow-hidden ${
        compact ? "p-6" : "p-8 md:p-14"
      }`}
    >
      <span
        aria-hidden="true"
        className="mono mb-5 inline-flex h-10 w-10 items-center justify-center rounded-md border border-flame/30 bg-flame/[0.07] text-flame-soft"
      >
        <Flame size={17} strokeWidth={1.8} />
      </span>
      <h3 className="display text-2xl md:text-3xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {action ? (
        <Link href={action.href} className="btn btn-secondary btn-sm mt-6">
          {action.label}
          <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export function StatBlock({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="stat-card">
      <span className="stat-number">{value}</span>
      <span className="mt-2 block text-[11px] text-muted">{label}</span>
      {hint ? <span className="stat-hint block">{hint}</span> : null}
    </div>
  );
}

export function FormMessage({
  status,
  message,
  className = "",
}: {
  status?: "idle" | "success" | "error";
  message?: string;
  className?: string;
}) {
  if (!message || !status || status === "idle") return null;
  return (
    <p
      aria-live="polite"
      role={status === "error" ? "alert" : "status"}
      className={`form-message ${
        status === "error" ? "form-message-error" : "form-message-success"
      } ${className}`}
    >
      {message}
    </p>
  );
}

export function InlineNote({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-2 border-flame/45 pl-3 text-xs leading-relaxed text-muted">
      {children}
    </div>
  );
}

export function KeyValue({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line-soft py-2.5 last:border-b-0">
      <span className="text-xs text-muted">{label}</span>
      <span className={`text-right text-sm ${mono ? "mono text-white" : ""}`}>{value}</span>
    </div>
  );
}
