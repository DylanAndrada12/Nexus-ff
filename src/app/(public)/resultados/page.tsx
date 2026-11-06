import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Crown,
  Medal,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { getPublishedResults } from "@/lib/queries/public";
import { formatCurrency, formatDate } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/ui";
import { MODALITY_LABELS, type Modality } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Resultados",
  description:
    "Resultados publicados de los torneos de Free Fire de NEXUS FF: posiciones, campeones, premios y MVP.",
};
export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const tournaments = await getPublishedResults(40);

  const totals = tournaments.reduce(
    (accumulator, tournament) => {
      const champion = tournament.results.find((result) => result.position === 1);
      return {
        tournaments: accumulator.tournaments + 1,
        prizes:
          accumulator.prizes +
          tournament.results.reduce((sum, result) => sum + result.prize, 0),
        championPrizes: accumulator.championPrizes + (champion?.prize ?? 0),
      };
    },
    { tournaments: 0, prizes: 0, championPrizes: 0 },
  );

  const currentYear = new Date().getFullYear();

  return (
    <>
      <section className="page-hero">
        <div className="container-nexus relative py-9 md:py-14">
          <PageHeader
            eyebrow={`Temporada ${currentYear} · Actas oficiales`}
            title="Resultados publicados"
            description="Actas finales de los torneos publicados. Cada posición, kill y premio sale de la carga administrativa y alimenta el ranking."
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-open">
                  <ShieldCheck size={10} aria-hidden="true" />
                  Actas verificadas
                </span>
                <Link href="/ranking" className="btn btn-secondary btn-sm">
                  Ver ranking
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            }
          />

          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
            <div className="stat-card">
              <span className="stat-icon">
                <Trophy size={13} aria-hidden="true" />
              </span>
              <div className="stat-number">{totals.tournaments}</div>
              <p className="stat-label">Torneos publicados</p>
              <p className="stat-hint">Con acta final</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                <Wallet size={13} aria-hidden="true" />
              </span>
              <div className="stat-number text-[clamp(1.25rem,2.8vw,2.05rem)]">
                {formatCurrency(totals.prizes)}
              </div>
              <p className="stat-label">Premios entregados</p>
              <p className="stat-hint">Total distribuido</p>
            </div>
            <div className="stat-card col-span-2 md:col-span-1">
              <span className="stat-icon">
                <Crown size={13} aria-hidden="true" />
              </span>
              <div className="stat-number text-[clamp(1.25rem,2.8vw,2.05rem)]">
                {formatCurrency(totals.championPrizes)}
              </div>
              <p className="stat-label">Premios a campeones</p>
              <p className="stat-hint">Según actas</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-nexus py-8 md:py-12">
        {tournaments.length === 0 ? (
          <EmptyState
            title="Sin resultados publicados"
            description="Cuando termine un torneo y la administración publique el acta, va a aparecer acá con el podio completo, MVP y premios."
            action={{ href: "/torneos", label: "Ver torneos" }}
          />
        ) : (
          <div className="space-y-4 md:space-y-5">
            {tournaments.map((tournament) => {
              const champion = tournament.results.find((result) => result.position === 1);
              const podium = tournament.results.slice(0, 3);
              return (
                <article key={tournament.id} className="panel overflow-hidden">
                  <div className="flex flex-col gap-4 border-b border-line bg-[#120c10]/50 p-4 sm:flex-row sm:items-start sm:justify-between md:p-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="badge badge-approved">Acta publicada</span>
                        <span className="mono flex items-center gap-1 text-[8px] uppercase tracking-[0.08em] text-[#8f8388]">
                          <CalendarDays size={10} aria-hidden="true" />
                          {formatDate(tournament.resultsPublishedAt ?? tournament.startsAt)}
                        </span>
                        <span className="mono text-[8px] uppercase tracking-[0.08em] text-[#8f8388]">
                          {MODALITY_LABELS[tournament.modality as Modality]}
                        </span>
                        <span className="mono flex items-center gap-1 text-[8px] uppercase tracking-[0.08em] text-[#8f8388]">
                          <Users size={10} aria-hidden="true" />
                          {tournament.registrations.length} equipos
                        </span>
                      </div>
                      <h2 className="display mt-2 text-3xl md:text-4xl">{tournament.name}</h2>
                      <p className="mt-1.5 text-[11px] text-[#8f8388]">
                        Campeón:{" "}
                        <Link
                          href={`/equipos/${champion?.team.id ?? "#"}`}
                          className="font-medium text-white underline decoration-line underline-offset-4 hover:decoration-flame"
                        >
                          {champion?.team.name ?? "Sin datos"}
                        </Link>
                      </p>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <p className="mono flex items-center gap-1.5 text-[8px] uppercase tracking-[0.1em] text-[#8f8388] sm:justify-end">
                        <Trophy size={10} className="text-gold" aria-hidden="true" />
                        Premio del campeón
                      </p>
                      <p className="mono mt-1 text-lg text-gold">
                        {champion && champion.prize > 0
                          ? formatCurrency(champion.prize)
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`grid gap-2 p-3 md:p-4 ${
                      podium.length === 1
                        ? "sm:grid-cols-1 sm:justify-items-center"
                        : podium.length === 2
                          ? "sm:grid-cols-2"
                          : "sm:grid-cols-3"
                    }`}
                  >
                    {podium.map((result) => {
                      const isChampion = result.position === 1;
                      return (
                        <Link
                          key={result.team.id}
                          href={`/equipos/${result.team.id}`}
                          className={`group relative overflow-hidden rounded-lg border p-4 transition-colors ${
                            podium.length === 1 ? "w-full max-w-xl" : ""
                          } ${
                            isChampion
                              ? "border-flame/40 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(120,20,33,.36),transparent_70%),linear-gradient(180deg,#180c11,#0c080a)]"
                              : "border-white/[0.075] bg-[#0e0a0c]/80 hover:border-flame/30"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="rank-badge" data-rank={result.position}>
                              {String(result.position).padStart(2, "0")}
                            </span>
                            {isChampion ? (
                              <span className="badge badge-tier badge-gold">
                                <Crown size={9} aria-hidden="true" />
                                Campeón
                              </span>
                            ) : (
                              <Medal
                                size={13}
                                className={result.position === 2 ? "text-silver" : "text-bronze"}
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <div className="mt-3 flex items-center gap-2.5">
                            <span className="rank-team-avatar" data-rank={result.position}>
                              {result.team.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={result.team.logoUrl} alt="" />
                              ) : (
                                result.team.tag.slice(0, 2)
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-semibold text-white transition-colors group-hover:text-flame-soft">
                                {result.team.name}
                              </p>
                              <p className="mono text-[7.5px] uppercase tracking-[0.08em] text-[#8f8388]">
                                {result.team.tag} · {result.kills} kills · {result.points} pts
                              </p>
                            </div>
                          </div>
                          {result.mvpName ? (
                            <p className="mt-3 border-t border-line-soft pt-2 text-[10px] text-[#8f8388]">
                              MVP: <span className="text-white">{result.mvpName}</span>
                            </p>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
                    <Link
                      href={`/torneos/${tournament.slug}`}
                      className="section-action"
                    >
                      Ver acta completa
                      <ArrowUpRight size={12} aria-hidden="true" />
                    </Link>
                    <span className="mono text-[8px] uppercase tracking-[0.08em] text-[#7e7176]">
                      {tournament.results.length} posiciones publicadas
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
