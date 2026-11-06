import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  Flame,
  Medal,
  Megaphone,
  MessageCircle,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
import { getLandingData } from "@/lib/queries/public";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { ActionForm } from "@/components/forms/action-form";
import { submitSupportMessageAction } from "@/actions/support";
import { TournamentRow } from "@/components/tournament-row";
import { RankingTable } from "@/components/ranking-table";
import { SectionHeading } from "@/components/ui";
import { FireParticles } from "@/components/fire-particles";
import { FeaturedCarousel } from "@/components/featured-carousel";

export const dynamic = "force-dynamic";

const proofPoints = [
  "Inscripción por WhatsApp",
  "Cupos, salas y horarios controlados",
  "Resultados y ranking públicos",
];

export default async function LandingPage() {
  const [data, user] = await Promise.all([getLandingData(), getCurrentUser()]);
  const {
    upcoming,
    latestResults,
    stats,
    ranking,
    champions,
    announcement,
    settings,
  } = data;

  const teamCta = user ? "/panel/equipos/nuevo" : "/registro";
  const contactName = user?.name ?? "";
  const contactEmail = user?.email ?? "";
  const season = new Date().getFullYear();

  return (
    <>
      {announcement ? (
        <div className="border-b border-flame/15 bg-[#110b0e]">
          <div className="container-nexus flex flex-col gap-2 py-2.5 md:flex-row md:items-center md:gap-4">
            <span className="badge badge-flame w-fit shrink-0">
              <Megaphone size={10} aria-hidden="true" />
              Aviso
            </span>
            <p className="text-[11.5px] leading-relaxed text-[#c9bec2]">
              <span className="font-medium text-white">{announcement.title}</span>
              <span className="mx-2 text-[#5c4c52]">/</span>
              {announcement.body}
            </p>
          </div>
        </div>
      ) : null}

      <div className="border-b border-line bg-[#0a0709] md:hidden">
        <div className="container-nexus no-scrollbar flex gap-1.5 overflow-x-auto py-2.5">
          <Link href="/torneos" className="filter-tab" data-active="true">
            Torneos disponibles
          </Link>
          <Link href="/torneos?scope=todos" className="filter-tab">
            En vivo / activos
          </Link>
          <Link href="/ranking" className="filter-tab">
            Rankings
          </Link>
        </div>
      </div>

      <section className="home-hero">
        <FireParticles />
        <div className="container-nexus relative py-8 md:py-14 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
            <div className="reveal">
              <p className="kicker">
                Temporada {season} · Circuito Free Fire Argentina
              </p>
              <h1 className="display mt-3 text-[clamp(2.75rem,7vw,5.35rem)]">
                Acá se juega
                <br />
                <span className="display-outline">en serio.</span>
              </h1>
              <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-[#c9bec2] md:mt-5 md:text-[15px]">
                Torneos de Free Fire con inscripción por WhatsApp y resultados
                verificados. Competí por premios reales desde cualquier punto de
                Argentina.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link href="/torneos" className="btn btn-primary">
                  Ver torneos
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
                <Link href={teamCta} className="btn btn-secondary">
                  {user ? "Crear mi equipo" : "Registrarme"}
                </Link>
              </div>

              <ul className="mt-7 grid gap-2.5 border-t border-line pt-5 sm:grid-cols-3">
                {proofPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-[11px] leading-relaxed text-[#a1979b]">
                    <span className="mt-0.5 grid h-4 w-4 flex-none place-items-center rounded-full border border-flame/30 bg-flame/[0.07] text-flame-soft">
                      <Check size={9} strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              {upcoming.length > 0 ? (
                <FeaturedCarousel tournaments={upcoming} />
              ) : (
                <div className="panel-accent panel overflow-hidden p-6 md:p-8">
                  <span className="section-heading-icon">
                    <Trophy size={17} aria-hidden="true" />
                  </span>
                  <h2 className="display mt-5 text-3xl">Calendario en preparación</h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                    Todavía no hay un torneo publicado. Cuando se abra una
                    inscripción, va a aparecer acá con fecha, premio y cupos
                    reales.
                  </p>
                  <Link href="/torneos" className="btn btn-secondary btn-block mt-6">
                    Ver torneos
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="stat-grid relative mt-8 md:mt-11">
            <div className="stat-card">
              <span className="stat-icon">
                <Trophy size={13} aria-hidden="true" />
              </span>
              <div className="stat-number">{formatNumber(stats.finishedTournaments)}</div>
              <p className="stat-label">Torneos realizados</p>
              <p className="stat-hint">Resultados publicados</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                <Users size={13} aria-hidden="true" />
              </span>
              <div className="stat-number">{formatNumber(stats.teamsParticipating)}</div>
              <p className="stat-label">Equipos participantes</p>
              <p className="stat-hint">Inscripciones confirmadas</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                <Medal size={13} aria-hidden="true" />
              </span>
              <div className="stat-number text-[clamp(1.25rem,2.6vw,2.05rem)]">
                {formatCurrency(stats.prizesDelivered)}
              </div>
              <p className="stat-label">Premios entregados</p>
              <p className="stat-hint">Según actas publicadas</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                <Swords size={13} aria-hidden="true" />
              </span>
              <div className="stat-number">{formatNumber(stats.playersRegistered)}</div>
              <p className="stat-label">Jugadores registrados</p>
              <p className="stat-hint">Cuentas activas</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-nexus py-12 md:py-20" aria-labelledby="proximos">
        <SectionHeading
          id="proximos"
          icon={<CalendarDays size={15} strokeWidth={1.9} />}
          title="Próximos torneos"
          description="Fecha, premio y cupos reales."
          action={{ href: "/torneos", label: "Ver calendario completo" }}
        />

        {upcoming.length > 0 ? (
          <div className="tournament-list">
            {upcoming.map((tournament) => (
              <TournamentRow key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div className="panel p-7 md:p-10">
            <h3 className="display text-3xl">Todavía no hay torneos publicados</h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              Cuando se abra la inscripción de un torneo, va a aparecer en este
              calendario con su fecha, premio y cupos actualizados. No mostramos
              torneos de ejemplo.
            </p>
            <Link href={teamCta} className="btn btn-secondary btn-sm mt-6">
              {user ? "Preparar mi equipo" : "Crear mi cuenta"}
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>

      <section className="border-y border-line bg-[#080608]">
        <div className="container-nexus grid gap-10 py-12 md:py-20 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <SectionHeading
              icon={<Trophy size={15} strokeWidth={1.9} />}
              title="Últimos campeones"
              description="Equipos que cerraron el acta en primer lugar."
              action={{ href: "/resultados", label: "Ver resultados" }}
            />
            {champions.length > 0 ? (
              <ol className="overflow-hidden rounded-[10px] border border-white/[0.075] bg-gradient-to-b from-[#130d11]/90 to-[#090708]/95">
                {champions.map((champion, index) => (
                  <li key={`${champion.tournamentId}-${champion.team.id}`}>
                    <Link
                      href={`/torneos/${champion.slug}`}
                      className="rank-row group"
                    >
                      <span className="rank-badge" data-rank={index + 1}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="rank-team-avatar" data-rank={index + 1}>
                        {champion.team.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={champion.team.logoUrl} alt="" />
                        ) : (
                          champion.team.tag.slice(0, 2)
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-white transition-colors group-hover:text-flame-soft">
                          {champion.team.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-[#8f8388]">
                          {champion.tournamentName} · {formatDate(champion.date)}
                        </span>
                      </span>
                      <span className="mono shrink-0 text-[10px] text-gold">
                        {champion.prize > 0 ? formatCurrency(champion.prize) : "—"}
                      </span>
                      <ArrowUpRight
                        size={12}
                        className="shrink-0 text-[#665a5f]"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="panel p-7">
                <span className="section-heading-icon">
                  <Trophy size={15} aria-hidden="true" />
                </span>
                <p className="mt-4 text-sm font-medium text-white">
                  Todavía no hay campeones publicados
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  El primer equipo campeón va a quedar registrado cuando se
                  publique el acta de resultados de un torneo.
                </p>
              </div>
            )}
          </div>

          <div>
            <SectionHeading
              icon={<BarChart3 size={15} strokeWidth={1.9} />}
              title="Ranking competitivo"
              description="Puntos acumulados en todas las actas publicadas."
              action={{ href: "/ranking", label: "Ver ranking completo" }}
            />
            <RankingTable rows={ranking} limit={5} />
          </div>
        </div>
      </section>

      <section className="container-nexus py-12 md:py-20" aria-labelledby="resultados">
        <SectionHeading
          id="resultados"
          icon={<Medal size={15} strokeWidth={1.9} />}
          title="Últimos torneos"
          description="Posiciones finales, premios y equipos que llegaron al podio."
          action={{ href: "/resultados", label: "Todos los resultados" }}
        />

        {latestResults.length > 0 ? (
          <div
            className={`grid gap-3 ${
              latestResults.length === 1
                ? "md:grid-cols-[minmax(0,420px)] md:justify-center"
                : latestResults.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-3"
            }`}
          >
            {latestResults.map((tournament) => {
              const champion = tournament.results.find((result) => result.position === 1);
              const second = tournament.results.find((result) => result.position === 2);
              const third = tournament.results.find((result) => result.position === 3);
              return (
                <Link
                  key={tournament.id}
                  href={`/torneos/${tournament.slug}`}
                  className="group panel relative overflow-hidden p-5 transition-colors hover:border-flame/35 md:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="mono text-[8px] uppercase tracking-[0.08em] text-[#8f8388]">
                      {formatDate(tournament.resultsPublishedAt ?? tournament.startsAt)}
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="text-[#665a5f] transition-colors group-hover:text-flame-soft"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-3 text-[15px] font-semibold leading-snug text-white">
                    {tournament.name}
                  </h3>
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="mono text-[8px] uppercase tracking-[0.1em] text-[#84777c]">
                      Campeón
                    </p>
                    <p className="display mt-1 text-2xl text-flame-soft">
                      {champion?.team.name ?? "Sin datos"}
                    </p>
                  </div>
                  <dl className="mt-3 space-y-1.5 text-[11.5px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#8f8388]">2° puesto</dt>
                      <dd className="truncate text-[#c9bec2]">{second?.team.name ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#8f8388]">3° puesto</dt>
                      <dd className="truncate text-[#c9bec2]">{third?.team.name ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-line-soft pt-1.5">
                      <dt className="text-[#8f8388]">Premio del campeón</dt>
                      <dd className="mono text-gold">
                        {champion && champion.prize > 0
                          ? formatCurrency(champion.prize)
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="panel p-7 md:p-10">
            <h3 className="display text-3xl">Sin resultados publicados</h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              Acá van a aparecer las posiciones finales de cada torneo, con su
              campeón, podio y premios entregados. El administrador publica el
              acta cuando termina la competencia.
            </p>
          </div>
        )}
      </section>

      <section className="border-y border-line">
        <div className="container-nexus grid gap-10 py-12 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="kicker">La organización</p>
            <h2 className="display mt-3 text-[clamp(2.6rem,5.2vw,4.6rem)]">
              Nos ocupamos
              <br />
              de todo lo que
              <br />
              <span className="display-outline">no se juega.</span>
            </h2>
          </div>
          <div className="lg:pt-1">
            <p className="text-[13px] leading-relaxed text-[#c9bec2] md:text-sm">
              {settings.organization_text ||
                "NEXUS FF es una organización independiente de esports dedicada a Free Fire en Argentina. Armamos torneos de principio a fin: reglamento, inscripción, control de cupos, salas y publicación de resultados."}
            </p>

            <ol className="mt-7 overflow-hidden rounded-[10px] border border-white/[0.075]">
              {[
                {
                  title: "Elegí tu torneo y anotá tu equipo",
                  text: "El capitán registra la escuadra completa, con nombres de juego y UID verificables.",
                  icon: Trophy,
                },
                {
                  title: "Coordiná tu inscripción por WhatsApp",
                  text: "Cada torneo tiene su propio grupo. La organización confirma el cupo y avisa por ahí.",
                  icon: MessageCircle,
                },
                {
                  title: "Recibí la sala y jugá",
                  text: "Los capitanes de equipos confirmados acceden a los datos de la sala. Después, el acta y el ranking quedan públicos.",
                  icon: Swords,
                },
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.title}
                    className="grid grid-cols-[34px_1fr] gap-3 border-b border-line-soft bg-[#0d090b]/70 px-4 py-4 last:border-b-0"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-md border border-flame/25 bg-flame/[0.055] text-flame-soft">
                      <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-[13px] font-semibold text-white">
                        <span className="mono mr-2 text-[8px] text-[#7f6f75]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {step.title}
                      </h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#8f8388]">
                        {step.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

          </div>
        </div>
      </section>

      <section id="contacto" className="container-nexus scroll-mt-24 py-12 md:py-20">
        <div className="grid gap-9 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div>
            <p className="kicker">Soporte competitivo</p>
            <h2 className="display mt-3 text-[clamp(2.8rem,5vw,4.8rem)]">Hablemos.</h2>
            <p className="mt-4 max-w-md text-[13px] leading-relaxed text-muted">
              Dudas sobre inscripciones, salas o reglamentos. Escribinos y te
              respondemos por email.
            </p>

            <dl className="mt-7 overflow-hidden rounded-[10px] border border-white/[0.075] text-sm">
              {settings.contact_email ? (
                <div className="border-b border-line-soft bg-[#0d090b]/60 px-4 py-3">
                  <dt className="mono text-[8px] uppercase tracking-[0.1em] text-[#84777c]">
                    Email
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="text-[13px] text-white underline decoration-line underline-offset-4 hover:decoration-flame"
                    >
                      {settings.contact_email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.contact_whatsapp ? (
                <div className="border-b border-line-soft bg-[#0d090b]/60 px-4 py-3">
                  <dt className="mono text-[8px] uppercase tracking-[0.1em] text-[#84777c]">
                    WhatsApp
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`https://wa.me/${settings.contact_whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[13px] text-white underline decoration-line underline-offset-4 hover:decoration-flame"
                    >
                      {settings.contact_whatsapp}
                    </a>
                  </dd>
                </div>
              ) : null}
              {settings.support_hours ? (
                <div className="border-b border-line-soft bg-[#0d090b]/60 px-4 py-3 last:border-b-0">
                  <dt className="mono text-[8px] uppercase tracking-[0.1em] text-[#84777c]">
                    Horarios de atención
                  </dt>
                  <dd className="mt-1 text-[13px] text-[#c9bec2]">{settings.support_hours}</dd>
                </div>
              ) : null}
              {!settings.contact_email &&
              !settings.contact_whatsapp &&
              !settings.support_hours ? (
                <div className="px-4 py-3 text-xs text-muted">
                  Los canales de contacto se publican desde la administración.
                </div>
              ) : null}
            </dl>

            {settings.contact_note ? (
              <p className="mt-4 text-[11px] leading-relaxed text-[#8f8388]">
                {settings.contact_note}
              </p>
            ) : null}
          </div>

          <div className="panel-accent panel p-5 md:p-7">
            <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <h3 className="text-base font-semibold">Mensaje de soporte</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  El mensaje queda registrado en el panel administrativo. No
                  compartas contraseñas.
                </p>
              </div>
              <span className="badge badge-flame hidden sm:inline-flex">
                <Flame size={9} aria-hidden="true" />
                Soporte
              </span>
            </div>
            <div className="mt-5">
              <ActionForm
                action={submitSupportMessageAction}
                submitLabel="Enviar mensaje"
                pendingLabel="Enviando…"
                className="space-y-4"
              >
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="field">
                    <label htmlFor="contact-name" className="label">
                      Nombre
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      defaultValue={contactName}
                      required
                      minLength={2}
                      maxLength={80}
                      className="input"
                      autoComplete="name"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="contact-email" className="label">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      defaultValue={contactEmail}
                      required
                      className="input"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="contact-message" className="label">
                    Mensaje
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={5}
                    className="textarea"
                    placeholder="Contanos qué necesitás."
                  />
                </div>
              </ActionForm>
            </div>
          </div>
        </div>
      </section>

      <section className="container-nexus pb-12 md:pb-20">
        <div className="panel-wine relative overflow-hidden p-6 md:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 hidden opacity-[0.055] md:block"
          >
            <Trophy size={250} strokeWidth={1} />
          </div>
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="kicker">Próxima partida</p>
              <h2 className="display mt-2 text-[clamp(2.2rem,4.6vw,3.7rem)]">
                Tu equipo ya está listo.
              </h2>
              <p className="mt-2 max-w-md text-[12.5px] text-[#b6a9ae]">
                Elegí un torneo, completá la plantilla y unite al grupo de WhatsApp.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/torneos" className="btn btn-primary">
                Explorar torneos
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              <Link href={teamCta} className="btn btn-secondary">
                {user ? "Gestionar equipo" : "Crear mi cuenta"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
