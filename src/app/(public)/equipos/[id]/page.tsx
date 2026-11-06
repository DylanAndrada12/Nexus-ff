import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Crown,
  Medal,
  ShieldCheck,
  Swords,
  Target,
  Trophy,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { getPublicTeam } from "@/lib/queries/public";
import { formatCurrency, formatDate } from "@/lib/format";
import { KeyValue, StatusBadge } from "@/components/ui";
import { MODALITY_LABELS, type Modality } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const team = await getPublicTeam(id);
  if (!team) return { title: "Equipo" };
  return {
    title: `${team.name} (${team.tag})`,
    description: `Perfil competitivo de ${team.name} en NEXUS FF.`,
  };
}

export default async function PublicTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await getPublicTeam(id);
  if (!team) notFound();

  const wins = team.results.filter((result) => result.position === 1).length;
  const top3 = team.results.filter((result) => result.position <= 3).length;
  const prize = team.results.reduce((sum, result) => sum + result.prize, 0);
  const modality =
    MODALITY_LABELS[team.modality as Modality] ?? team.modality;

  return (
    <>
      <section className="page-hero">
        <div className="container-nexus relative py-8 md:py-12">
          <Link
            href="/ranking"
            className="mono inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.1em] text-[#9b8e93] transition-colors hover:text-white"
          >
            <ArrowLeft size={12} aria-hidden="true" />
            Volver al ranking
          </Link>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4 md:gap-5">
              <div className="team-logo" data-suspended={team.suspended ? "true" : "false"}>
                {team.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={team.logoUrl} alt={`Escudo de ${team.name}`} />
                ) : (
                  <span className="display text-3xl text-white/90">
                    {team.tag.slice(0, 2)}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="badge badge-flame">
                    <Swords size={9} aria-hidden="true" />
                    {modality}
                  </span>
                  {team.suspended ? (
                    <StatusBadge status="REJECTED" />
                  ) : (
                    <StatusBadge status="CONFIRMED" />
                  )}
                </div>
                <h1 className="display mt-2 break-words text-[clamp(1.95rem,6.5vw,4.2rem)]">
                  {team.name}
                </h1>
                <p className="mono mt-1.5 text-[9px] uppercase tracking-[0.1em] text-[#a89ba0]">
                  [{team.tag}] · {modality}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Capitán: {team.captain.name}
                </p>
              </div>
            </div>

            <Link href="/ranking" className="btn btn-secondary btn-sm w-fit shrink-0">
              Ranking general
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="hero-info-box">
              <p className="hero-info-label flex items-center gap-1.5">
                <Target size={10} aria-hidden="true" /> Torneos jugados
              </p>
              <p className="hero-info-value">{team.results.length}</p>
              <p className="mono mt-0.5 text-[9px] text-[#9b8e93]">Con resultados</p>
            </div>
            <div className="hero-info-box">
              <p className="hero-info-label flex items-center gap-1.5">
                <Crown size={10} aria-hidden="true" /> Títulos
              </p>
              <p className="hero-info-value text-flame-soft">{wins}</p>
              <p className="mono mt-0.5 text-[9px] text-[#9b8e93]">Primeros puestos</p>
            </div>
            <div className="hero-info-box">
              <p className="hero-info-label flex items-center gap-1.5">
                <Medal size={10} aria-hidden="true" /> Podios
              </p>
              <p className="hero-info-value">{top3}</p>
              <p className="mono mt-0.5 text-[9px] text-[#9b8e93]">Top 3</p>
            </div>
            <div className="hero-info-box">
              <p className="hero-info-label flex items-center gap-1.5">
                <Wallet size={10} aria-hidden="true" /> Premios
              </p>
              <p className="hero-info-value">{prize > 0 ? formatCurrency(prize) : "—"}</p>
              <p className="mono mt-0.5 text-[9px] text-[#9b8e93]">Acumulados</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-nexus py-8 md:py-12">
        {team.suspended ? (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-danger/25 bg-danger/[0.06] p-4">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-white">Equipo suspendido</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">
                Este equipo no puede inscribirse a nuevos torneos mientras la
                suspensión siga activa. El historial se conserva como registro público.
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <section className="panel p-5 md:p-6">
              <div className="section-heading">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="section-heading-icon" aria-hidden="true">
                    <UserRound size={15} />
                  </span>
                  <div>
                    <h2 className="section-title">Datos del equipo</h2>
                    <p className="mt-1 text-[11px] text-muted">
                      Identidad y trayectoria verificada por NEXUS FF.
                    </p>
                  </div>
                </div>
              </div>

              <KeyValue label="Capitán" value={team.captain.name} />
              <KeyValue label="Etiqueta" value={`[${team.tag}]`} mono />
              <KeyValue label="Modalidad" value={modality} />
              <KeyValue label="Alta" value={formatDate(team.createdAt)} />
              <KeyValue
                label="Estado"
                value={
                  team.suspended ? (
                    <span className="text-danger">Suspendido</span>
                  ) : (
                    <span className="text-success">Activo</span>
                  )
                }
              />
            </section>

            <section className="panel p-5 md:p-6">
              <div className="section-heading">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="section-heading-icon" aria-hidden="true">
                    <Users size={15} />
                  </span>
                  <div>
                    <h2 className="section-title">Plantilla</h2>
                    <p className="mt-1 text-[11px] text-muted">
                      {team.members.length} jugador{team.members.length === 1 ? "" : "es"}{" "}
                      registrados
                    </p>
                  </div>
                </div>
              </div>

              {team.members.length === 0 ? (
                <p className="text-sm text-muted">
                  El equipo todavía no tiene jugadores cargados.
                </p>
              ) : (
                <ul className="roster-grid">
                  {team.members.map((member, index) => {
                    const isStarter = member.role === "TITULAR";
                    return (
                      <li key={member.id} className="roster-card">
                        <span className="roster-number" aria-hidden="true">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-white">
                            {member.gameName}
                          </p>
                          <p
                            className={`roster-role ${
                              isStarter ? "text-flame-soft" : "text-muted"
                            }`}
                          >
                            {isStarter ? "Titular" : "Suplente"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="panel p-5 md:p-6">
              <div className="section-heading">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="section-heading-icon" aria-hidden="true">
                    <Trophy size={15} />
                  </span>
                  <div>
                    <h2 className="section-title">Historial competitivo</h2>
                    <p className="mt-1 text-[11px] text-muted">
                      Resultados oficiales publicados por la organización.
                    </p>
                  </div>
                </div>
              </div>

              {team.results.length === 0 ? (
                <div className="rounded-lg border border-dashed border-line bg-white/[0.015] px-5 py-8 text-center">
                  <Trophy size={18} className="mx-auto text-[#6f5f65]" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-white">Sin resultados publicados</p>
                  <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted">
                    Cuando la organización publique una tabla, el rendimiento del
                    equipo va a aparecer acá.
                  </p>
                </div>
              ) : (
                <ul className="-mx-1">
                  {team.results.map((result) => (
                    <li key={result.id} className="rank-row !items-start">
                      <span
                        className="rank-badge"
                        data-rank={result.position <= 3 ? result.position : undefined}
                      >
                        {result.position}°
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/torneos/${result.tournament.slug}`}
                          className="text-[13px] font-medium text-white transition-colors hover:text-flame-soft"
                        >
                          {result.tournament.name}
                        </Link>
                        <p className="mono mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] uppercase tracking-[0.05em] text-[#8f8388]">
                          <CalendarDays size={9} aria-hidden="true" />
                          {formatDate(result.tournament.startsAt)}
                          <span aria-hidden="true">·</span>
                          {result.kills} kills
                          <span aria-hidden="true">·</span>
                          {result.points} pts
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="mono text-[11px] text-flame-soft">
                          {result.prize > 0 ? formatCurrency(result.prize) : "—"}
                        </p>
                        <p className="mono text-[7.5px] uppercase tracking-[0.08em] text-[#6f6368]">
                          Premio
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {team.registrations.length > 0 ? (
              <section className="panel p-5 md:p-6">
                <div className="section-heading">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="section-heading-icon" aria-hidden="true">
                      <Swords size={15} />
                    </span>
                    <div>
                      <h2 className="section-title">Participaciones</h2>
                      <p className="mt-1 text-[11px] text-muted">
                        Torneos con inscripción confirmada.
                      </p>
                    </div>
                  </div>
                </div>

                <ul>
                  {team.registrations.map((registration) => (
                    <li
                      key={registration.tournament.id}
                      className="flex items-center justify-between gap-3 border-b border-line-soft py-3 last:border-b-0"
                    >
                      <Link
                        href={`/torneos/${registration.tournament.slug}`}
                        className="min-w-0 truncate text-[13px] text-white transition-colors hover:text-flame-soft"
                      >
                        {registration.tournament.name}
                      </Link>
                      <span className="mono shrink-0 text-[9px] uppercase tracking-[0.06em] text-[#8f8388]">
                        {formatDate(registration.tournament.startsAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>

        <div className="panel mt-8 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center md:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="section-heading-icon">
              <Swords size={15} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">Competí en el próximo torneo</h2>
              <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-muted">
                Revisá el calendario, inscribí a tu equipo y sumá puntos para el
                ranking de la temporada.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Link href="/torneos" className="btn btn-primary btn-sm flex-1 sm:flex-none">
              Ver torneos
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
            <Link href="/ranking" className="btn btn-secondary btn-sm flex-1 sm:flex-none">
              Ver ranking
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
