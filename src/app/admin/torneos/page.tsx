import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminTournaments } from "@/lib/queries/admin";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { MODALITY_LABELS, type Modality } from "@/lib/constants";

export const metadata: Metadata = { title: "Torneos · Administración" };
export const dynamic = "force-dynamic";

export default async function AdminTournamentsPage() {
  await requireAdmin();
  const tournaments = await getAdminTournaments();

  return (
    <>
      <PageHeader
        title="Torneos"
        description="Creá, editá y cancelá torneos. Los cambios de modalidad se bloquean con inscripciones activas."
        actions={
          <Link href="/admin/torneos/nuevo" className="btn btn-primary btn-sm">
            Nuevo torneo
          </Link>
        }
      />

      {tournaments.length === 0 ? (
        <EmptyState
          title="No hay torneos creados"
          description="Creá el primero con fecha, modalidad, cupos, premio y enlace de WhatsApp. La landing va a mostrar un estado vacío hasta que exista un torneo real."
          action={{ href: "/admin/torneos/nuevo", label: "Crear torneo" }}
        />
      ) : (
        <div className="table-wrap border border-line bg-surface">
          <table className="data-table">
            <thead>
              <tr>
                <th>Torneo</th>
                <th>Fecha</th>
                <th>Modalidad</th>
                <th>Acceso</th>
                <th className="text-right">Cupos</th>
                <th>WhatsApp</th>
                <th>Estado</th>
                <th>Sala</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tournaments.map((tournament) => (
                <tr key={tournament.id}>
                  <td>
                    <Link
                      href={`/admin/torneos/${tournament.id}`}
                      className="font-medium text-white hover:underline hover:underline-offset-4"
                    >
                      {tournament.name}
                    </Link>
                    <div className="mono mt-0.5 text-[10px] text-muted">
                      {tournament.prizePool > 0
                        ? formatCurrency(tournament.prizePool)
                        : "Sin premio"}
                    </div>
                  </td>
                  <td className="mono text-xs">{formatDateTime(tournament.startsAt)}</td>
                  <td className="text-xs">
                    {MODALITY_LABELS[tournament.modality as Modality]}
                  </td>
                  <td className="text-xs">
                    {tournament.access === "PRIVATE" ? "Privado" : "Público"}
                  </td>
                  <td className="mono text-right text-xs">
                    {tournament._count.registrations}/{tournament.maxTeams}
                  </td>
                  <td className="text-xs">
                    {tournament.whatsappUrl ? (
                      <span className="text-success">Configurado</span>
                    ) : (
                      <span className="text-muted">Sin enlace</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={tournament.status} />
                  </td>
                  <td className="text-xs text-muted">
                    {tournament.room
                      ? tournament.room.published
                        ? "Publicada"
                        : "Borrador"
                      : "—"}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/torneos/${tournament.id}`}
                      className="text-xs text-white underline decoration-line underline-offset-4"
                    >
                      Gestionar
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
