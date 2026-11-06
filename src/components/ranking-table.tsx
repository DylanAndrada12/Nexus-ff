import Link from "next/link";
import { ChevronRight, Medal, Trophy } from "lucide-react";
import type { RankingRow } from "@/lib/rankings";
import { formatNumber } from "@/lib/format";

export function RankingTable({
  rows,
  limit,
  startIndex = 0,
}: {
  rows: RankingRow[];
  limit?: number;
  startIndex?: number;
}) {
  const visible = typeof limit === "number" ? rows.slice(0, limit) : rows;

  if (visible.length === 0) {
    return (
      <div className="panel p-8">
        <span className="mono mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-flame/30 bg-flame/[0.07] text-flame-soft">
          <Trophy size={16} aria-hidden="true" />
        </span>
        <p className="display text-2xl">Ranking en formación</p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          La tabla se activa automáticamente cuando se publican los resultados
          del primer torneo. No mostramos posiciones inventadas.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-[10px] border border-white/[0.075] bg-gradient-to-b from-[#130d11]/90 to-[#090708]/95 md:hidden">
        {visible.map((row, index) => {
          const position = startIndex + index + 1;
          const winRate = row.tournaments > 0 ? Math.round((row.wins / row.tournaments) * 100) : 0;
          const isPodium = position <= 3;
          return (
            <Link
              key={row.teamId}
              href={`/equipos/${row.teamId}`}
              className="rank-row group"
              data-rank={position}
            >
              <span className="rank-badge" data-rank={position}>
                {position}
              </span>
              <span className="rank-team-avatar" data-rank={position}>
                {row.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.logoUrl} alt="" />
                ) : (
                  row.tag.slice(0, 2)
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[13px] font-semibold text-white group-hover:text-flame-soft">
                    {row.name}
                  </span>
                  {isPodium ? (
                    <Medal
                      size={11}
                      className={
                        position === 1
                          ? "text-gold"
                          : position === 2
                            ? "text-silver"
                            : "text-bronze"
                      }
                      aria-hidden="true"
                    />
                  ) : null}
                </span>
                <span className="mono mt-0.5 flex items-center gap-1.5 text-[7.5px] uppercase tracking-[0.06em] text-[#8f8388]">
                  <span>{row.tag}</span>
                  <span className="text-[#4b3d43]">/</span>
                  <span>{row.tournaments} torneos</span>
                  <span className="text-[#4b3d43]">/</span>
                  <span>{row.wins} títulos</span>
                </span>
                <span className="mt-1.5 flex items-center gap-2">
                  <span className="rate-bar max-w-[90px]">
                    <span style={{ width: `${winRate}%` }} />
                  </span>
                  <span className="mono text-[7.5px] text-[#8f8388]">{winRate}%</span>
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="mono block text-[10px] uppercase tracking-[0.04em] text-flame-soft">
                  {formatNumber(row.points)}
                  <span className="ml-1 text-[6.5px] text-[#8f8388]">PTS</span>
                </span>
                <span className="mono mt-0.5 block text-[7.5px] text-[#8f8388]">
                  {formatNumber(row.kills)} kills
                </span>
              </span>
              <ChevronRight size={13} className="shrink-0 text-[#665a5f]" aria-hidden="true" />
            </Link>
          );
        })}
      </div>

      <div className="table-wrap hidden md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-16"># Pos</th>
              <th>Jugador / Equipo</th>
              <th className="text-right">Torneos</th>
              <th className="text-right">Títulos</th>
              <th className="text-right">Top 3</th>
              <th className="text-right">Kills</th>
              <th>Tasa de títulos</th>
              <th className="text-right">Puntos</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => {
              const position = startIndex + index + 1;
              const winRate =
                row.tournaments > 0 ? Math.round((row.wins / row.tournaments) * 100) : 0;
              return (
                <tr key={row.teamId}>
                  <td>
                    <span className="rank-badge" data-rank={position}>
                      {String(position).padStart(2, "0")}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/equipos/${row.teamId}`}
                      className="group flex items-center gap-3"
                    >
                      <span className="rank-team-avatar" data-rank={position}>
                        {row.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.logoUrl} alt="" />
                        ) : (
                          row.tag.slice(0, 2)
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[220px] truncate text-[13px] font-medium text-white transition-colors group-hover:text-flame-soft">
                          {row.name}
                        </span>
                        <span className="mono mt-0.5 block text-[8px] uppercase tracking-[0.08em] text-[#8f8388]">
                          {row.tag}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="mono text-right text-[#a1979b]">{row.tournaments}</td>
                  <td className="mono text-right text-white">{row.wins}</td>
                  <td className="mono text-right text-[#a1979b]">{row.top3}</td>
                  <td className="mono text-right text-[#a1979b]">{formatNumber(row.kills)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="rate-bar max-w-[72px]">
                        <span style={{ width: `${winRate}%` }} />
                      </span>
                      <span className="mono text-[9px] text-[#a1979b]">{winRate}%</span>
                    </div>
                  </td>
                  <td className="mono text-right text-[13px] font-medium text-flame-soft">
                    {formatNumber(row.points)}
                  </td>
                  <td className="text-right">
                    <Link href={`/equipos/${row.teamId}`} className="btn btn-secondary btn-sm">
                      Ver perfil
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
