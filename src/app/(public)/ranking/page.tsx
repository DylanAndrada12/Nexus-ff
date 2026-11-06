import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Crown,
  Medal,
  ShieldCheck,
  Swords,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { getRanking } from "@/lib/rankings";
import { RankingTable } from "@/components/ranking-table";
import { AdminPagination } from "@/components/admin/pagination";
import { PageHeader } from "@/components/ui";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Ranking",
  description:
    "Ranking competitivo de equipos de Free Fire de NEXUS FF, calculado con los resultados publicados.",
};
export const dynamic = "force-dynamic";

const sortOptions = [
  { value: "puntos", label: "General" },
  { value: "titulos", label: "Títulos" },
  { value: "kills", label: "Kills" },
  { value: "participaciones", label: "Participaciones" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

const PAGE_SIZE = 10;

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ orden?: string; page?: string }>;
}) {
  const params = await searchParams;
  const rows = await getRanking(100);
  const sort = sortOptions.some((option) => option.value === params.orden)
    ? (params.orden as SortValue)
    : "puntos";
  const requestedPage = Number(params.page ?? "1");
  const currentYear = new Date().getFullYear();

  const sorted = [...rows].sort((a, b) => {
    if (sort === "titulos") {
      return b.wins - a.wins || b.points - a.points || b.top3 - a.top3;
    }
    if (sort === "kills") {
      return b.kills - a.kills || b.points - a.points || b.wins - a.wins;
    }
    if (sort === "participaciones") {
      return b.tournaments - a.tournaments || b.points - a.points || b.wins - a.wins;
    }
    return (
      b.points - a.points ||
      b.wins - a.wins ||
      b.top3 - a.top3 ||
      b.kills - a.kills ||
      a.name.localeCompare(b.name)
    );
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Number.isFinite(requestedPage)
    ? Math.min(totalPages, Math.max(1, Math.floor(requestedPage)))
    : 1;
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const leader = sorted[0];
  const podium =
    sorted.length >= 3 ? [sorted[1], sorted[0], sorted[2]] : sorted.slice(0, 2);

  const totalTournaments = rows.reduce((sum, row) => sum + row.tournaments, 0);
  const totalKills = rows.reduce((sum, row) => sum + row.kills, 0);
  const totalTitles = rows.reduce((sum, row) => sum + row.wins, 0);

  function sortHref(value: SortValue) {
    const search = new URLSearchParams();
    if (value !== "puntos") search.set("orden", value);
    const query = search.toString();
    return `/ranking${query ? `?${query}` : ""}`;
  }

  function pageHref(nextPage: number) {
    const search = new URLSearchParams();
    if (sort !== "puntos") search.set("orden", sort);
    if (nextPage > 1) search.set("page", String(nextPage));
    const query = search.toString();
    return `/ranking${query ? `?${query}` : ""}`;
  }

  return (
    <>
      <section className="page-hero">
        <div className="container-nexus relative py-9 md:py-14">
          <PageHeader
            eyebrow={`Temporada ${currentYear} · Clasificación global`}
            title="Rankings y estadísticas"
            description="Puntos acumulados por equipo en todas las actas publicadas. La clasificación se recalcula con cada resultado oficial de NEXUS FF."
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-open">
                  <ShieldCheck size={10} aria-hidden="true" />
                  Datos verificados
                </span>
                <Link href="/resultados" className="btn btn-secondary btn-sm">
                  Ver resultados
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            }
          />

          {rows.length > 0 ? (
            <div className="filter-panel flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="filter-label">Ordenar clasificación</p>
                <div className="no-scrollbar flex gap-1 overflow-x-auto" role="tablist" aria-label="Orden del ranking">
                  {sortOptions.map((option) => (
                    <Link
                      key={option.value}
                      href={sortHref(option.value)}
                      className="filter-tab"
                      data-active={sort === option.value ? "true" : "false"}
                      role="tab"
                      aria-current={sort === option.value ? "page" : undefined}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>
              <p className="mono flex items-center gap-2 text-[8px] uppercase tracking-[0.1em] text-[#84777c]">
                <span className="live-dot" aria-hidden="true" />
                Top 100 · {formatNumber(rows.length)} equipo
                {rows.length === 1 ? "" : "s"} clasificado
                {rows.length === 1 ? "" : "s"}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <div className="container-nexus py-8 md:py-12">
        {podium.length > 0 ? (
          <section aria-labelledby="podio" className="hidden md:block">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <span className="section-heading-icon">
                  <Crown size={15} aria-hidden="true" />
                </span>
                <h2 id="podio" className="mono text-[10px] uppercase tracking-[0.14em] text-[#a1979b]">
                  Salón de la fama · Podio de honor
                </h2>
              </div>
              <p className="mono text-[8px] uppercase tracking-[0.1em] text-[#6f6368]">
                Ranking global NEXUS FF · Top 3
              </p>
            </div>

            <div className="podium-grid" data-count={podium.length}>
              {podium.map((row) => {
                const position = sorted.findIndex((item) => item.teamId === row.teamId) + 1;
                const isChampion = position === 1;
                return (
                  <Link
                    key={row.teamId}
                    href={`/equipos/${row.teamId}`}
                    className="podium-card group"
                    data-rank={position}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="podium-rank">
                        #{String(position).padStart(2, "0")}
                      </span>
                      <span
                        className={`badge badge-tier ${
                          position === 1
                            ? "badge-gold"
                            : position === 2
                              ? "badge-silver"
                              : "badge-bronze"
                        }`}
                      >
                        {position === 1 ? <Crown size={9} aria-hidden="true" /> : <Medal size={9} aria-hidden="true" />}
                        {position === 1 ? "Líder global" : position === 2 ? "Plata" : "Bronce"}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-col items-center text-center">
                      <span className="podium-avatar overflow-hidden">
                        {row.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.logoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          row.tag.slice(0, 2)
                        )}
                      </span>
                      <p className="mono mt-3 text-[8px] uppercase tracking-[0.12em] text-[#8f8388]">
                        {row.tag}
                      </p>
                      <h3 className="mt-1 max-w-full truncate text-xl font-semibold text-white transition-colors group-hover:text-flame-soft">
                        {row.name}
                      </h3>
                      <p className="mono mt-1 text-[9px] text-[#8f8388]">
                        {row.tournaments} torneos · {row.wins} títulos
                      </p>
                    </div>

                    <div className="mt-auto pt-5">
                      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-white/[0.075] bg-line text-center">
                        <div className="bg-[#0d090b] px-1 py-2">
                          <p className="mono text-[11px] text-white">{formatNumber(row.points)}</p>
                          <p className="mono mt-0.5 text-[7px] uppercase tracking-[0.08em] text-[#7e7176]">
                            Puntos
                          </p>
                        </div>
                        <div className="bg-[#0d090b] px-1 py-2">
                          <p className="mono text-[11px] text-white">{row.top3}</p>
                          <p className="mono mt-0.5 text-[7px] uppercase tracking-[0.08em] text-[#7e7176]">
                            Top 3
                          </p>
                        </div>
                        <div className="bg-[#0d090b] px-1 py-2">
                          <p className="mono text-[11px] text-white">{formatNumber(row.kills)}</p>
                          <p className="mono mt-0.5 text-[7px] uppercase tracking-[0.08em] text-[#7e7176]">
                            Kills
                          </p>
                        </div>
                      </div>
                      {isChampion ? (
                        <p className="mono mt-3 text-center text-[7.5px] uppercase tracking-[0.13em] text-gold">
                          Campeón del circuito
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <div className={`stat-grid ${podium.length > 0 ? "mt-8 md:mt-12" : ""}`}>
          <div className="stat-card">
            <span className="stat-icon">
              <Users size={13} aria-hidden="true" />
            </span>
            <div className="stat-number">{formatNumber(rows.length)}</div>
            <p className="stat-label">Equipos clasificados</p>
            <p className="stat-hint">Con puntos publicados</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">
              <Swords size={13} aria-hidden="true" />
            </span>
            <div className="stat-number">{formatNumber(totalTournaments)}</div>
            <p className="stat-label">Participaciones</p>
            <p className="stat-hint">En torneos con acta</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">
              <Target size={13} aria-hidden="true" />
            </span>
            <div className="stat-number">{formatNumber(totalKills)}</div>
            <p className="stat-label">Kills registradas</p>
            <p className="stat-hint">Datos oficiales</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">
              <Trophy size={13} aria-hidden="true" />
            </span>
            <div className="stat-number">{formatNumber(totalTitles)}</div>
            <p className="stat-label">Títulos entregados</p>
            <p className="stat-hint">Primeros puestos</p>
          </div>
        </div>

        {leader ? (
          <div className="panel-accent panel mt-4 flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <span className="rank-badge h-9 w-9 text-[11px]" data-rank={1}>
              #01
            </span>
            <span className="rank-team-avatar h-10 w-10" data-rank={1}>
              {leader.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={leader.logoUrl} alt="" />
              ) : (
                leader.tag.slice(0, 2)
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="mono text-[8px] uppercase tracking-[0.1em] text-[#8f8388]">
                Líder actual del circuito
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-white">
                {leader.name}{" "}
                <span className="mono text-[8px] font-normal text-[#8f8388]">
                  · {formatNumber(leader.points)} puntos
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/equipos/${leader.teamId}`} className="btn btn-secondary btn-sm">
                Ver equipo
              </Link>
              <Link href="/torneos" className="btn btn-primary btn-sm">
                Entrar a competir
                <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : null}

        <section className="mt-8" aria-labelledby="tabla-ranking">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="tabla-ranking"
                className="flex items-center gap-2 text-sm font-semibold text-white"
              >
                <BarChart3 size={15} className="text-flame-soft" aria-hidden="true" />
                Top 100 general
              </h2>
              <p className="mono mt-1 text-[8px] uppercase tracking-[0.08em] text-[#7e7176]">
                {sorted.length > 0
                  ? `Mostrando ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, sorted.length)} de ${sorted.length} equipos`
                  : "Sin equipos clasificados"}
              </p>
            </div>
            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              {sortOptions.map((option) => (
                <Link
                  key={option.value}
                  href={sortHref(option.value)}
                  className="filter-tab"
                  data-active={sort === option.value ? "true" : "false"}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>

          <RankingTable rows={pageRows} startIndex={(page - 1) * PAGE_SIZE} />

          <AdminPagination
            page={page}
            totalPages={totalPages}
            buildHref={pageHref}
          />

          <p className="mt-4 max-w-2xl text-[11px] leading-relaxed text-[#8f8388]">
            El ranking se recalcula en cada consulta a partir de las actas publicadas.
            Un torneo despublicado deja de sumar puntos automáticamente.
          </p>
        </section>
      </div>
    </>
  );
}
