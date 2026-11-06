import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminOverview } from "@/lib/queries/admin";
import { formatDateTime } from "@/lib/format";
import { occupancyFrom } from "@/lib/tournaments";
import { PageHeader, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Administración" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const overview = await getAdminOverview();

  const cards = [
    {
      label: "Inscripciones confirmadas",
      value: String(overview.confirmed),
      hint: "Cupos ocupados",
      href: "/admin/inscripciones",
    },
    {
      label: "Inscripciones pendientes",
      value: String(overview.pending),
      hint: "Por confirmar",
      href: "/admin/inscripciones?estado=PENDING",
    },
    {
      label: "Torneos",
      value: String(overview.tournaments),
      hint: "Creados en la plataforma",
      href: "/admin/torneos",
    },
    {
      label: "Equipos",
      value: String(overview.teams),
      hint: "Equipos registrados",
      href: "/admin/equipos",
    },
    {
      label: "Usuarios",
      value: String(overview.users),
      hint: "Cuentas registradas",
      href: "/admin/usuarios",
    },
    {
      label: "Mensajes abiertos",
      value: String(overview.openMessages),
      hint: "Soporte sin resolver",
      href: "/admin/mensajes",
    },
  ];

  const nextOccupancy = overview.nextTournament
    ? occupancyFrom(
        overview.nextTournament.registrations,
        overview.nextTournament.maxTeams,
      )
    : null;

  return (
    <>
      <PageHeader
        title="Resumen operativo"
        description="Estado real de la plataforma: torneos, equipos e inscripciones."
        actions={
          <Link href="/admin/torneos/nuevo" className="btn btn-primary btn-sm">
            Crear torneo
          </Link>
        }
      />

      <div className="stat-grid">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="stat-card group transition-colors hover:border-flame/30"
          >
            <p className="text-[11px] text-muted">{card.label}</p>
            <p className="stat-number mt-2">{card.value}</p>
            <p className="stat-hint">{card.hint}</p>
            <ArrowUpRight
              size={14}
              className="mt-3 text-muted transition-colors group-hover:text-flame-soft"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel">
          <div className="flex items-center justify-between gap-3 border-b border-line p-5">
            <h2 className="display text-2xl">Últimas inscripciones</h2>
            <Link href="/admin/inscripciones" className="text-xs text-muted hover:text-white">
              Ver todas
            </Link>
          </div>
          {overview.recentRegistrations.length === 0 ? (
            <p className="p-5 text-sm text-muted">Todavía no hay inscripciones.</p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {overview.recentRegistrations.map((registration) => (
                <li key={registration.id} className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      {registration.team.name}{" "}
                      <span className="mono text-[10px] text-muted">
                        {registration.team.tag}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {registration.tournament.name}
                    </p>
                    <p className="mono mt-0.5 text-[10px] text-muted">
                      {formatDateTime(registration.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={registration.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="flex items-center justify-between gap-3 border-b border-line p-5">
            <h2 className="display text-2xl">Próximo torneo</h2>
            <Link href="/admin/torneos" className="text-xs text-muted hover:text-white">
              Torneos
            </Link>
          </div>
          {overview.nextTournament && nextOccupancy ? (
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={overview.nextTournament.status} />
                <span className="mono text-[10px] text-muted">
                  {formatDateTime(overview.nextTournament.startsAt)}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{overview.nextTournament.name}</h3>
              <p className="mt-1 text-xs text-muted">
                {nextOccupancy.confirmed} confirmados · {nextOccupancy.available} cupos
                libres de {overview.nextTournament.maxTeams}
              </p>
              <Link
                href={`/admin/torneos/${overview.nextTournament.id}`}
                className="btn btn-secondary btn-sm mt-4"
              >
                Gestionar torneo
              </Link>
            </div>
          ) : (
            <p className="p-5 text-sm text-muted">No hay torneos próximos cargados.</p>
          )}
        </section>
      </div>

      <section className="panel mt-6">
        <div className="flex items-center justify-between gap-3 border-b border-line p-5">
          <h2 className="display text-2xl">Auditoría reciente</h2>
          <Link href="/admin/auditoria" className="text-xs text-muted hover:text-white">
            Ver todo
          </Link>
        </div>
        {overview.recentAudit.length === 0 ? (
          <p className="p-5 text-sm text-muted">Sin operaciones registradas todavía.</p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {overview.recentAudit.map((log) => (
              <li key={log.id} className="p-4">
                <p className="mono text-[10px] text-white">{log.action}</p>
                <p className="mt-1 text-xs text-muted">
                  {log.entity}
                  {log.entityId ? ` · ${log.entityId.slice(0, 10)}…` : ""} ·{" "}
                  {log.admin?.name ?? "Sistema"}
                </p>
                <p className="mono mt-1 text-[10px] text-[#5f5f5f]">
                  {formatDateTime(log.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
