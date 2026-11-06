import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
  X,
} from "lucide-react";
import { getTournamentList } from "@/lib/queries/public";
import { TournamentRow } from "@/components/tournament-row";
import { EmptyState, PageHeader } from "@/components/ui";
import { MODALITIES, MODALITY_LABELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Torneos",
  description:
    "Calendario de torneos de Free Fire de NEXUS FF: fechas, premios, cupos y modalidades.",
};
export const dynamic = "force-dynamic";

const scopes = [
  { value: "proximos", label: "Próximos" },
  { value: "finalizados", label: "Finalizados" },
  { value: "todos", label: "Todos" },
] as const;

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; modalidad?: string; q?: string }>;
}) {
  const params = await searchParams;
  const scope = ["proximos", "finalizados", "todos"].includes(params.scope ?? "")
    ? (params.scope as "proximos" | "finalizados" | "todos")
    : "proximos";
  const modality = MODALITIES.includes(params.modalidad as (typeof MODALITIES)[number])
    ? params.modalidad
    : undefined;
  const query = params.q?.trim().slice(0, 80) ?? "";

  const tournaments = await getTournamentList({ scope, modality, q: query });
  const currentYear = new Date().getFullYear();

  function href(
    nextScope: string,
    nextModality?: string,
    nextQuery: string | null = query,
  ) {
    const search = new URLSearchParams();
    search.set("scope", nextScope);
    const chosen = nextModality ?? modality;
    if (chosen) search.set("modalidad", chosen);
    if (nextQuery) search.set("q", nextQuery);
    return `/torneos?${search.toString()}`;
  }

  return (
    <>
      <section className="page-hero">
        <div className="container-nexus relative py-9 md:py-14">
          <PageHeader
            eyebrow={`Circuito NEXUS · Temporada ${currentYear}`}
            title="Torneos y calendario"
            description="Todos los torneos públicos de NEXUS FF. Los privados solo aparecen para los equipos invitados."
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-open">
                  <ShieldCheck size={10} aria-hidden="true" />
                  Cupos verificados
                </span>
                <Link href="/ranking" className="btn btn-secondary btn-sm">
                  Ver ranking
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            }
          />

          <div className="filter-panel">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <p className="filter-label">Estado del torneo</p>
                <div
                  className="no-scrollbar flex gap-1 overflow-x-auto"
                  role="tablist"
                  aria-label="Estado del torneo"
                >
                  {scopes.map((item) => {
                    const active = scope === item.value;
                    return (
                      <Link
                        key={item.value}
                        href={href(item.value)}
                        className="filter-tab"
                        data-active={active ? "true" : "false"}
                        aria-current={active ? "page" : undefined}
                        role="tab"
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="min-w-0">
                <p className="filter-label">Modalidad de juego</p>
                <div className="no-scrollbar flex gap-1 overflow-x-auto" aria-label="Modalidad">
                  <Link
                    href={href(scope, "")}
                    className="filter-tab"
                    data-active={!modality ? "true" : "false"}
                  >
                    Todas
                  </Link>
                  {MODALITIES.map((item) => (
                    <Link
                      key={item}
                      href={href(scope, item)}
                      className="filter-tab"
                      data-active={modality === item ? "true" : "false"}
                    >
                      {MODALITY_LABELS[item]}
                    </Link>
                  ))}
                </div>
              </div>

              <form
                action="/torneos"
                method="get"
                role="search"
                className="flex w-full gap-2 xl:w-auto"
              >
                <input type="hidden" name="scope" value={scope} />
                {modality ? (
                  <input type="hidden" name="modalidad" value={modality} />
                ) : null}
                <label className="search-box min-w-0 flex-1 xl:w-[230px]">
                  <Search size={14} className="shrink-0" aria-hidden="true" />
                  <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="Buscar torneo…"
                    aria-label="Buscar torneo por nombre"
                  />
                </label>
                <button type="submit" className="btn btn-primary btn-sm">
                  <SlidersHorizontal size={13} aria-hidden="true" />
                  Filtrar
                </button>
              </form>
            </div>

            {query ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3">
                <span className="mono text-[8px] uppercase tracking-[0.1em] text-[#84777c]">
                  Búsqueda
                </span>
                <span className="badge badge-flame">
                  {query}
                  <Link
                    href={href(scope, undefined, null)}
                    aria-label="Quitar búsqueda"
                    className="ml-0.5 text-flame-soft hover:text-white"
                  >
                    <X size={10} />
                  </Link>
                </span>
                <Link href="/torneos" className="mono text-[8px] uppercase tracking-[0.08em] text-[#8f8388] underline underline-offset-4 hover:text-white">
                  Limpiar filtros
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container-nexus py-8 md:py-12">
        {tournaments.length === 0 ? (
          <EmptyState
            title="No hay torneos para mostrar"
            description="No hay torneos publicados con este filtro. Cuando se abra una inscripción, va a aparecer en el calendario con fecha, premio y cupos reales."
            action={{ href: "/registro", label: "Crear cuenta" }}
          />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="mono flex items-center gap-2 text-[9px] uppercase tracking-[0.08em] text-[#8f8388]">
                <CalendarDays size={12} aria-hidden="true" />
                {tournaments.length} torneo{tournaments.length === 1 ? "" : "s"} encontrado
                {tournaments.length === 1 ? "" : "s"}
              </p>
              <span className="mono text-[8px] uppercase tracking-[0.08em] text-[#6f6368]">
                Actualizado en tiempo real
              </span>
            </div>
            <div className="tournament-list">
              {tournaments.map((tournament) => (
                <TournamentRow key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </>
        )}

        <div className="panel mt-8 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center md:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="section-heading-icon">
              <Trophy size={15} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">Torneos privados</h2>
              <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-muted">
                Los torneos privados no aparecen en este calendario. Se accede por
                invitación del administrador o con un código de acceso que se canjea
                desde el panel del capitán.
              </p>
            </div>
          </div>
          <Link href="/panel/torneos" className="btn btn-secondary btn-sm shrink-0">
            Ir a mi panel
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  );
}
