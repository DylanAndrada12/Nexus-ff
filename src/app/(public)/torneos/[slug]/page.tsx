import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Crown,
  Lock,
  MessageCircle,
  Trophy,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getTournamentBySlug } from "@/lib/queries/public";
import { StatusBadge } from "@/components/ui";
import { WhatsAppRegistrationButton } from "@/components/whatsapp-registration";
import { formatCurrency, formatDate, formatDateTime, formatTime } from "@/lib/format";
import {
  MODALITY_LABELS,
  TOURNAMENT_FORMAT_LABELS,
  type Modality,
  type TournamentFormat,
} from "@/lib/constants";
import {
  parsePointsConfig,
  parsePrizeDistribution,
} from "@/lib/tournaments";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug, null);
  if (!tournament) return { title: "Torneo" };

  const description = tournament.description.slice(0, 160);
  const ogImage = `/assets/og-torneo.jpg`;

  return {
    title: tournament.name,
    description,
    openGraph: {
      title: `${tournament.name} · NEXUS FF`,
      description,
      url: `/torneos/${slug}`,
      siteName: "NEXUS FF",
      images: [{ url: ogImage, width: 1200, height: 630, alt: tournament.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tournament.name} · NEXUS FF`,
      description,
      images: [ogImage],
    },
  };
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const tournament = await getTournamentBySlug(slug, user);
  if (!tournament) notFound();

  const prizes = parsePrizeDistribution(tournament.prizeDistribution);
  const points = parsePointsConfig(tournament.pointsConfig);
  const champion = tournament.results.find((result) => result.position === 1);
  const formatLabel =
    TOURNAMENT_FORMAT_LABELS[tournament.format as TournamentFormat] ?? tournament.format;
  const whatsappAvailable = Boolean(tournament.whatsappUrl);
  const registrationAvailable =
    whatsappAvailable && tournament.registrationOpen;
  const unavailableMessage = !whatsappAvailable
    ? "La inscripción todavía no está disponible."
    : !tournament.registrationOpen
      ? (tournament.registrationReason ?? "La inscripción no está disponible.")
      : null;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        {tournament.bannerUrl ? (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tournament.bannerUrl}
              alt=""
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080608] via-[#080608]/80 to-[#080608]/40" />
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0 grid-lines" aria-hidden="true" />
        )}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-flame/[0.09] blur-[110px]"
          aria-hidden="true"
        />

        <div className="container-nexus relative py-9 md:py-14">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={tournament.status} />
            <span className="badge badge-tier badge-flame">
              <Trophy size={9} aria-hidden="true" />
              {MODALITY_LABELS[tournament.modality as Modality]}
            </span>
            {tournament.featured ? (
              <span className="badge badge-flame">
                <Crown size={9} aria-hidden="true" />
                Destacado
              </span>
            ) : null}
          </div>

          <h1 className="display mt-4 max-w-5xl text-[clamp(2.6rem,6.5vw,5.2rem)]">
            {tournament.name}
          </h1>
          <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-[#c9bec2] md:text-[15px]">
            {tournament.description}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="hero-info-box">
              <p className="hero-info-label flex items-center gap-1.5">
                <CalendarDays size={10} aria-hidden="true" /> Fecha
              </p>
              <p className="mt-1.5 text-[13px] font-medium text-white">
                {formatDate(tournament.startsAt)} · {formatTime(tournament.startsAt)} hs
              </p>
            </div>
            <div className="hero-info-box">
              <p className="hero-info-label flex items-center gap-1.5">
                <Trophy size={10} aria-hidden="true" /> Premio total
              </p>
              <p className="mt-1.5 text-[13px] font-medium text-flame-soft">
                {tournament.prizePool > 0 ? formatCurrency(tournament.prizePool) : "A definir"}
              </p>
            </div>
            <div className="hero-info-box">
              <p className="hero-info-label flex items-center gap-1.5">
                <Users size={10} aria-hidden="true" /> Cupos
              </p>
              <p className="mt-1.5 text-[13px] font-medium text-white">
                {tournament.occupancy.available} libres de {tournament.maxTeams}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {registrationAvailable && tournament.whatsappUrl ? (
              <WhatsAppRegistrationButton
                tournamentName={tournament.name}
                whatsappUrl={tournament.whatsappUrl}
                label="Inscribirse"
              />
            ) : (
              <span className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-xs text-muted">
                <Lock size={13} aria-hidden="true" />
                {unavailableMessage}
              </span>
            )}
            <a href="#equipos" className="btn btn-secondary">
              Ver equipos
            </a>
            {user ? (
              <Link href="/panel/inscripciones" className="btn btn-ghost">
                Mi panel
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container-nexus grid gap-9 py-8 md:py-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
        <div className="min-w-0">
          <section id="inscripcion" className="scroll-mt-24">
            <div className="section-heading">
              <div className="flex items-center gap-3">
                <span className="section-heading-icon">
                  <MessageCircle size={15} aria-hidden="true" />
                </span>
                <h2 className="section-title">Inscripción</h2>
              </div>
              <span className="mono text-[8px] uppercase tracking-[0.08em] text-[#8f8388]">
                {tournament.occupancy.confirmed} confirmados
              </span>
            </div>

            {registrationAvailable && tournament.whatsappUrl ? (
              <div className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
                <div>
                  <p className="text-sm font-medium text-white">
                    La inscripción se gestiona por WhatsApp.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Entrá al grupo del torneo para coordinar tu cupo con la organización.
                  </p>
                </div>
                <WhatsAppRegistrationButton
                  tournamentName={tournament.name}
                  whatsappUrl={tournament.whatsappUrl}
                  className="btn btn-primary shrink-0"
                  label="Inscribirme"
                />
              </div>
            ) : (
              <div className="panel flex items-center gap-3 p-5 text-sm text-warning">
                <Lock size={16} aria-hidden="true" />
                {unavailableMessage}
              </div>
            )}
          </section>

          <section className="mt-10">
            <div className="section-heading">
              <div className="flex items-center gap-3">
                <span className="section-heading-icon">
                  <Trophy size={15} aria-hidden="true" />
                </span>
                <h2 className="section-title">Formato y reglamento</h2>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="panel p-4 md:p-5">
                <p className="mono text-[8px] uppercase tracking-[0.1em] text-[#84777c]">
                  Formato
                </p>
                <p className="mt-1.5 text-sm text-white">{formatLabel}</p>
                {tournament.formatDetails ? (
                  <p className="prose-nexus mt-2 text-xs">{tournament.formatDetails}</p>
                ) : null}
              </div>
              <div className="panel p-4 md:p-5">
                <p className="mono text-[8px] uppercase tracking-[0.1em] text-[#84777c]">
                  Puntaje
                </p>
                <p className="mt-1.5 text-sm text-white">
                  {points.killPoints} punto{points.killPoints === 1 ? "" : "s"} por kill ·{" "}
                  {points.matches} partida{points.matches === 1 ? "" : "s"}
                </p>
                <p className="mt-2 text-xs text-muted">
                  Desempate:{" "}
                  {points.tiebreaker === "KILLS"
                    ? "eliminaciones"
                    : points.tiebreaker === "BEST_PLACEMENT"
                      ? "mejor posición"
                      : "puntos totales"}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <h3 className="mono mb-2 text-[8px] uppercase tracking-[0.1em] text-[#84777c]">
                Reglamento
              </h3>
              {tournament.rules ? (
                <div className="prose-nexus panel p-4 md:p-5">{tournament.rules}</div>
              ) : (
                <div className="panel p-4 text-xs text-muted md:p-5">
                  El reglamento se va a publicar antes del inicio del torneo.
                </div>
              )}
            </div>
          </section>

          <section id="equipos" className="mt-10 scroll-mt-24">
            <div className="section-heading">
              <div className="flex items-center gap-3">
                <span className="section-heading-icon">
                  <Users size={15} aria-hidden="true" />
                </span>
                <h2 className="section-title">Equipos confirmados</h2>
              </div>
              <span className="mono text-[8px] uppercase tracking-[0.08em] text-[#8f8388]">
                {tournament.participants.length} / {tournament.maxTeams}
              </span>
            </div>
            {tournament.participants.length === 0 ? (
              <div className="panel p-5 text-sm text-muted">
                Todavía no hay equipos confirmados.
              </div>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {tournament.participants.map((participant) => (
                  <li
                    key={participant.registrationId}
                    className="panel p-3.5 transition-colors hover:border-flame/30"
                  >
                    <div className="flex items-center gap-3">
                      {participant.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={participant.logoUrl}
                          alt=""
                          className="h-9 w-9 rounded-[5px] border border-line object-cover"
                        />
                      ) : (
                        <span className="rank-team-avatar h-9 w-9">
                          {participant.tag.slice(0, 2)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/equipos/${participant.teamId}`}
                          className="block truncate text-[13px] font-medium text-white hover:text-flame-soft"
                        >
                          {participant.name}
                        </Link>
                        <p className="mono text-[8px] uppercase tracking-[0.08em] text-muted">
                          {participant.tag}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {tournament.results.length > 0 ? (
            <section className="mt-10">
              <div className="section-heading">
                <div className="flex items-center gap-3">
                  <span className="section-heading-icon">
                    <Crown size={15} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="section-title">Resultados finales</h2>
                    {tournament.resultsPublishedAt ? (
                      <p className="mono mt-1 text-[8px] uppercase tracking-[0.08em] text-[#84777c]">
                        Publicados el {formatDateTime(tournament.resultsPublishedAt)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Pos.</th>
                      <th>Equipo</th>
                      <th className="text-right">Kills</th>
                      <th className="text-right">Puntos</th>
                      <th className="text-right">Premio</th>
                      <th>MVP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournament.results.map((result) => (
                      <tr key={`${result.team.id}-${result.position}`}>
                        <td>
                          <span className="rank-badge" data-rank={result.position}>
                            {String(result.position).padStart(2, "0")}
                          </span>
                        </td>
                        <td>
                          <Link
                            href={`/equipos/${result.team.id}`}
                            className="text-white hover:text-flame-soft"
                          >
                            {result.team.name}
                          </Link>
                          <span className="mono ml-2 text-[8px] text-muted">
                            {result.team.tag}
                          </span>
                        </td>
                        <td className="mono text-right">{result.kills}</td>
                        <td className="mono text-right text-white">{result.points}</td>
                        <td className="mono text-right text-gold">
                          {result.prize > 0 ? formatCurrency(result.prize) : "—"}
                        </td>
                        <td className="text-xs text-muted">{result.mvpName ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="panel p-4 md:p-5">
            <div className="flex items-center gap-2 text-flame-soft">
              <Trophy size={14} aria-hidden="true" />
              <h2 className="mono text-[9px] uppercase tracking-[0.11em]">Premios</h2>
            </div>
            {prizes.length > 0 ? (
              <ul className="mt-3 divide-y divide-line-soft">
                {prizes.map((prize) => (
                  <li key={prize.position} className="flex items-center justify-between py-2">
                    <span className="text-xs text-muted">{prize.position}° puesto</span>
                    <span className="mono text-sm text-white">{formatCurrency(prize.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-muted">
                La distribución de premios se va a publicar con el reglamento.
              </p>
            )}
          </div>

          <div className="panel p-4 md:p-5">
            <div className="flex items-center gap-2 text-flame-soft">
              <CalendarDays size={14} aria-hidden="true" />
              <h2 className="mono text-[9px] uppercase tracking-[0.11em]">Cierre de inscripción</h2>
            </div>
            <p className="mt-3 text-sm text-white">
              {tournament.registrationClosesAt
                ? formatDateTime(tournament.registrationClosesAt)
                : "Hasta agotar cupos"}
            </p>
          </div>

          {champion ? (
            <div className="panel-accent panel p-4 md:p-5">
              <p className="mono flex items-center gap-1.5 text-[8px] uppercase tracking-[0.1em] text-gold">
                <Crown size={11} aria-hidden="true" /> Campeón
              </p>
              <p className="display mt-1.5 text-3xl">{champion.team.name}</p>
              <p className="mono mt-1 text-[8.5px] text-[#8f8388]">
                {formatCurrency(champion.prize)} en premios
              </p>
            </div>
          ) : null}

          {user?.role === "ADMIN" ? (
            <div className="panel p-4 md:p-5">
              <p className="mono text-[8px] uppercase tracking-[0.1em] text-[#84777c]">
                Administración
              </p>
              <Link href="/admin/torneos" className="btn btn-secondary btn-sm mt-3">
                Gestionar torneo
                <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}
