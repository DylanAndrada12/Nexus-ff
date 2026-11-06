import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminAuditLogs } from "@/lib/queries/admin";
import { EmptyState, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Auditoría · Administración" };
export const dynamic = "force-dynamic";

function detailsText(details: string | null): string {
  if (!details) return "—";
  try {
    return JSON.stringify(JSON.parse(details));
  } catch {
    return details;
  }
}

export default async function AdminAuditPage() {
  await requireAdmin();
  const logs = await getAdminAuditLogs();

  return (
    <>
      <PageHeader
        title="Auditoría"
        description="Registro de acciones administrativas sobre torneos, equipos, inscripciones, usuarios y configuración."
      />

      {logs.length === 0 ? (
        <EmptyState
          title="Sin registros"
          description="Las operaciones administrativas van a quedar registradas acá con fecha, responsable y detalle."
          compact
        />
      ) : (
        <div className="table-wrap border border-line bg-surface">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>Administrador</th>
                <th>IP</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="mono whitespace-nowrap text-xs">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="mono text-xs text-white">{log.action}</td>
                  <td className="text-xs">
                    {log.entity}
                    {log.entityId ? (
                      <div className="mono mt-0.5 text-[10px] text-muted">
                        {log.entityId}
                      </div>
                    ) : null}
                  </td>
                  <td className="text-xs">
                    {log.admin?.name ?? "Sistema"}
                    {log.admin ? (
                      <div className="mt-0.5 text-[11px] text-muted">
                        {log.admin.email}
                      </div>
                    ) : null}
                  </td>
                  <td className="mono text-[10px] text-muted">{log.ip ?? "—"}</td>
                  <td className="max-w-[280px] break-words text-[11px] text-muted">
                    {detailsText(log.details)}
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
