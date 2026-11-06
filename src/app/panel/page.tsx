import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Bell, Trophy, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import {
  getCaptainOverview,
  getCaptainRegistrations,
} from "@/lib/queries/captain";
import { getUpcomingTournaments } from "@/lib/queries/public";
import { formatDateTime } from "@/lib/format";
import { PageHeader, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Panel" };
export const dynamic = "force-dynamic";

export default async function PanelOverviewPage() {
  const user = await requireUser("/panel");
  const [overview, registrations, upcoming] = await Promise.all([
    getCaptainOverview(user.id),
    getCaptainRegistrations(user.id),
    getUpcomingTournaments(3),
  ]);

  const active = registrations.filter((registration) =>
    ["PENDING", "CONFIRMED"].includes(registration.status),
  );
  const next = overview.nextRegistration;

  return (
    <>
      <PageHeader
        title="Resumen"
        description="Tus equipos, inscripciones y próximos horarios en un solo lugar."
        actions={
          <>
            <Link href="/panel/equipos/nuevo" className="btn btn-primary btn-sm">
              Crear equipo
            </Link>
            <Link href="/panel/torneos" className="btn btn-secondary btn-sm">
              Ver torneos
            </Link>
          </>
        }
      />

      <div className="stat-grid">
        {[
          { label: "Equipos", value: overview.teams, href: "/panel/equipos" },
          {
            label: "Inscripciones activas",
            value: overview.activeRegistrations,
            href: "/panel/inscripciones",
          },
          {
            label: "Notificaciones sin leer",
            value: overview.unread,
            href: "/panel/notificaciones",
          },
          {
            label: "Salas disponibles",
            value: registrations.filter(
              (registration) =>
                registration.status === "CONFIRMED" &&
                registration.tournament.room?.published,
            ).length,
            href: "/panel/salas",
          },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="stat-card group transition-colors hover:border-flame/30"
          >
            <div className="stat-number">{item.value}</div>
            <p className="stat-label">{item.label}</p>
            <ArrowUpRight
              size={14}
              className="mt-3 text-muted transition-colors group-hover:text-flame-soft"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-6">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
            <h2 className="display text-2xl">Próximo compromiso</h2>
            <Trophy size={17} className="text-muted" aria-hidden="true" />
          </div>
          {next ? (
            <div className="pt-5">
              <StatusBadge status={next.tournament.startsAt ? "CONFIRMED" : "PENDING"} />
              <h3 className="mt-3 text-xl font-semibold">{next.tournament.name}</h3>
              <p className="mt-1 text-sm text-muted">
                {next.team.name} · {formatDateTime(next.tournament.startsAt)}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/torneos/${next.tournament.slug}`}
                  className="btn btn-secondary btn-sm"
                >
                  Ver torneo
                </Link>
                <Link href="/panel/inscripciones" className="btn btn-ghost btn-sm">
                  Gestionar inscripción
                </Link>
              </div>
            </div>
          ) : (
            <div className="pt-5">
              <p className="text-sm text-muted">
                Todavía no tenés un torneo próximo con inscripción activa.
              </p>
              <Link href="/panel/torneos" className="btn btn-secondary btn-sm mt-4">
                Buscar torneo
              </Link>
            </div>
          )}
        </section>

        <section className="panel p-6">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
            <h2 className="display text-2xl">Inscripciones</h2>
            <Link href="/panel/inscripciones" className="text-xs text-muted hover:text-white">
              Ver todas
            </Link>
          </div>
          {registrations.length > 0 ? (
            <ul className="divide-y divide-line-soft">
              {registrations.slice(0, 4).map((registration) => (
                <li key={registration.id} className="py-3 first:pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {registration.tournament.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {registration.team.name} ·{" "}
                        {formatDateTime(registration.tournament.startsAt)}
                      </p>
                    </div>
                    <StatusBadge status={registration.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="pt-5">
              <p className="text-sm text-muted">No hay inscripciones registradas.</p>
              <Link href="/panel/equipos" className="btn btn-secondary btn-sm mt-4">
                Preparar equipo
              </Link>
            </div>
          )}
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3 border-b border-line pb-3">
          <h2 className="display text-2xl">Torneos abiertos</h2>
          <Link href="/panel/torneos" className="text-xs text-muted hover:text-white">
            Ver todos
          </Link>
        </div>
        {upcoming.length > 0 ? (
          <ul className="divide-y divide-line border border-line bg-surface">
            {upcoming.map((tournament) => (
              <li
                key={tournament.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={tournament.status} />
                    <span className="mono text-[10px] text-muted">
                      {formatDateTime(tournament.startsAt)}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-sm font-medium">{tournament.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {tournament.occupancy.available} cupos libres
                  </p>
                </div>
                <Link
                  href={`/torneos/${tournament.slug}`}
                  className="btn btn-secondary btn-sm"
                >
                  Ver torneo
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border border-line bg-surface p-6">
            <p className="text-sm text-muted">
              No hay torneos públicos con inscripción abierta en este momento.
            </p>
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/panel/equipos" className="panel flex items-center gap-3 p-4 hover:border-white/40">
          <Users size={17} className="text-muted" aria-hidden="true" />
          <span className="text-sm">Gestionar equipos</span>
        </Link>
        <Link
          href="/panel/notificaciones"
          className="panel flex items-center gap-3 p-4 hover:border-white/40"
        >
          <Bell size={17} className="text-muted" aria-hidden="true" />
          <span className="text-sm">Ver notificaciones</span>
        </Link>
        <Link
          href="/panel/historial"
          className="panel flex items-center gap-3 p-4 hover:border-white/40"
        >
          <Trophy size={17} className="text-muted" aria-hidden="true" />
          <span className="text-sm">Historial competitivo</span>
        </Link>
      </div>

      {active.length === 0 && overview.teams === 0 ? (
        <div className="mt-8 border border-line bg-surface p-6">
          <h2 className="display text-2xl">Empezá por tu equipo</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Para inscribirte en un torneo necesitás un equipo con la plantilla
            completa según la modalidad. El capitán debe figurar como titular.
          </p>
          <Link href="/panel/equipos/nuevo" className="btn btn-primary btn-sm mt-5">
            Crear mi primer equipo
          </Link>
        </div>
      ) : null}
    </>
  );
}
