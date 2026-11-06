import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminTeams } from "@/lib/queries/admin";
import { formatDate } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/ui";
import { MODALITY_LABELS, type Modality } from "@/lib/constants";

export const metadata: Metadata = { title: "Equipos · Administración" };
export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  await requireAdmin();
  const teams = await getAdminTeams();

  return (
    <>
      <PageHeader
        title="Equipos"
        description="Plantillas registradas en la plataforma. Podés revisar integrantes, inscripciones y suspender un equipo."
      />

      {teams.length === 0 ? (
        <EmptyState
          title="Todavía no hay equipos"
          description="Los equipos aparecen acá cuando un capitán crea uno desde su panel."
          compact
        />
      ) : (
        <div className="table-wrap border border-line bg-surface">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Modalidad</th>
                <th>Capitán</th>
                <th className="text-right">Jugadores</th>
                <th className="text-right">Inscripciones</th>
                <th>Alta</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td>
                    <Link
                      href={`/admin/equipos/${team.id}`}
                      className="font-medium text-white hover:underline hover:underline-offset-4"
                    >
                      {team.name}
                    </Link>
                    <div className="mono mt-0.5 text-[10px] text-muted">{team.tag}</div>
                  </td>
                  <td className="text-xs">
                    {MODALITY_LABELS[team.modality as Modality] ?? team.modality}
                  </td>
                  <td className="text-xs">
                    <span className="text-white">{team.captain.name}</span>
                    <div className="mt-0.5 text-[11px] text-muted">
                      {team.captain.email}
                    </div>
                  </td>
                  <td className="mono text-right text-xs">{team._count.members}</td>
                  <td className="mono text-right text-xs">
                    {team._count.registrations}
                  </td>
                  <td className="mono text-xs">{formatDate(team.createdAt)}</td>
                  <td>
                    {team.suspended ? (
                      <span className="badge badge-rejected">Suspendido</span>
                    ) : (
                      <span className="badge badge-confirmed">Activo</span>
                    )}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/equipos/${team.id}`}
                      className="text-xs text-white underline decoration-line underline-offset-4"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
