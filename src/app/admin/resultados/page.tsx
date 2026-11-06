import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminResultsTournaments } from "@/lib/queries/admin";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Resultados · Administración" };
export const dynamic = "force-dynamic";

export default async function AdminResultsPage() {
  await requireAdmin();
  const tournaments = await getAdminResultsTournaments();

  return (
    <>
      <PageHeader
        title="Resultados"
        description="Estado de las actas por torneo. La carga y publicación se hacen desde la gestión de cada torneo."
      />

      {tournaments.length === 0 ? (
        <EmptyState
          title="No hay torneos"
          description="Creá un torneo y confirmá inscripciones antes de cargar un acta de resultados."
          action={{ href: "/admin/torneos/nuevo", label: "Crear torneo" }}
          compact
        />
      ) : (
        <div className="table-wrap border border-line bg-surface">
          <table className="data-table">
            <thead>
              <tr>
                <th>Torneo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="text-right">Confirmadas</th>
                <th className="text-right">Resultados</th>
                <th>Publicación</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tournaments.map((tournament) => (
                <tr key={tournament.id}>
                  <td>
                    <Link
                      href={`/admin/torneos/${tournament.id}#resultados`}
                      className="font-medium text-white hover:underline hover:underline-offset-4"
                    >
                      {tournament.name}
                    </Link>
                  </td>
                  <td className="mono text-xs">
                    {formatDateTime(tournament.startsAt)}
                  </td>
                  <td>
                    <StatusBadge status={tournament.status} />
                  </td>
                  <td className="mono text-right text-xs">
                    {tournament._count.registrations}
                  </td>
                  <td className="mono text-right text-xs">
                    {tournament._count.results}
                  </td>
                  <td className="text-xs text-muted">
                    {tournament.resultsPublishedAt
                      ? formatDateTime(tournament.resultsPublishedAt)
                      : "Sin publicar"}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/torneos/${tournament.id}#resultados`}
                      className="text-xs text-white underline decoration-line underline-offset-4"
                    >
                      Cargar acta
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold">Cómo funciona el acta</h2>
        <ol className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
          <li>1. El torneo debe tener equipos con inscripción confirmada.</li>
          <li>
            2. Se carga posición, kills, premio y MVP de cada equipo confirmado. Los puntos
            se calculan con la configuración del torneo.
          </li>
          <li>
            3. El acta queda como borrador hasta que se publica. Solo las actas publicadas
            aparecen en el sitio y suman al ranking.
          </li>
        </ol>
      </div>
    </>
  );
}
