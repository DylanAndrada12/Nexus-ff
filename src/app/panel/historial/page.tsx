import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { getCaptainHistory } from "@/lib/queries/captain";
import { formatCurrency, formatDate } from "@/lib/format";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Historial competitivo" };
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requireUser("/panel/historial");
  const results = await getCaptainHistory(user.id);

  const totals = results.reduce(
    (accumulator, result) => ({
      tournaments: accumulator.tournaments + 1,
      points: accumulator.points + result.points,
      kills: accumulator.kills + result.kills,
      prize: accumulator.prize + result.prize,
      wins: accumulator.wins + (result.position === 1 ? 1 : 0),
    }),
    { tournaments: 0, points: 0, kills: 0, prize: 0, wins: 0 },
  );

  return (
    <>
      <PageHeader
        title="Historial competitivo"
        description="Resultados publicados de tus equipos. El ranking se calcula solo con actas publicadas."
        actions={
          <Link href="/ranking" className="btn btn-secondary btn-sm">
            Ver ranking público
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "Torneos", value: totals.tournaments },
          { label: "Títulos", value: totals.wins },
          { label: "Puntos", value: totals.points },
          { label: "Kills", value: totals.kills },
          { label: "Premios", value: formatCurrency(totals.prize) },
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <p className="stat-number text-2xl md:text-3xl">{item.value}</p>
            <p className="stat-label">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState
            title="Todavía no hay resultados"
            description="Cuando se publique el acta de un torneo en el que participaste, vas a ver acá tu posición, puntos, eliminaciones y premio."
            action={{ href: "/panel/torneos", label: "Buscar torneo" }}
          />
        ) : (
          <div className="table-wrap border border-line bg-surface">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Torneo</th>
                  <th>Equipo</th>
                  <th className="text-right">Posición</th>
                  <th className="text-right">Kills</th>
                  <th className="text-right">Puntos</th>
                  <th className="text-right">Premio</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <td>
                      <Link
                        href={`/torneos/${result.tournament.slug}`}
                        className="hover:underline hover:underline-offset-4"
                      >
                        {result.tournament.name}
                      </Link>
                      <div className="mono mt-0.5 text-[10px] text-muted">
                        {formatDate(result.tournament.startsAt)}
                      </div>
                    </td>
                    <td>
                      <span className="text-white">{result.team.name}</span>
                      <span className="mono ml-2 text-[10px] text-muted">
                        {result.team.tag}
                      </span>
                    </td>
                    <td className="text-right">
                      <StatusBadge status={result.position === 1 ? "APPROVED" : "FINISHED"} />
                      <span className="mono ml-2">{result.position}°</span>
                    </td>
                    <td className="mono text-right">{result.kills}</td>
                    <td className="mono text-right">{result.points}</td>
                    <td className="mono text-right">
                      {result.prize > 0 ? formatCurrency(result.prize) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
