import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminRegistrations } from "@/lib/queries/admin";
import { adminCancelRegistrationAction } from "@/actions/admin";
import { ActionForm } from "@/components/forms/action-form";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { AdminPagination, parsePage } from "@/components/admin/pagination";
import {
  REGISTRATION_STATUSES,
  REGISTRATION_STATUS_LABELS,
  type RegistrationStatus,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Inscripciones · Administración" };
export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; pagina?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const status = REGISTRATION_STATUSES.includes(query.estado as RegistrationStatus)
    ? (query.estado as RegistrationStatus)
    : "ALL";
  const page = parsePage(query.pagina);
  const { items: registrations, totalPages, total } = await getAdminRegistrations(status, page);

  const buildHref = (p: number) =>
    `/admin/inscripciones?${status !== "ALL" ? `estado=${status}&` : ""}pagina=${p}`;

  return (
    <>
      <PageHeader
        title="Inscripciones"
        description="Equipos confirmados por la organización. Cancelar una inscripción libera el cupo y notifica al capitán."
        actions={
          <a
            href={`/api/admin/export-inscripciones${status !== "ALL" ? `?estado=${status}` : ""}`}
            className="btn btn-secondary btn-sm"
            download
          >
            Exportar CSV
          </a>
        }
      />

      <div className="mb-5 flex flex-wrap gap-1">
        <Link
          href="/admin/inscripciones"
          className="filter-tab"
          data-active={status === "ALL" ? "true" : "false"}
          aria-current={status === "ALL" ? "page" : undefined}
        >
          Todas
        </Link>
        {REGISTRATION_STATUSES.map((item) => (
          <Link
            key={item}
            href={`/admin/inscripciones?estado=${item}`}
            className="filter-tab"
            data-active={status === item ? "true" : "false"}
            aria-current={status === item ? "page" : undefined}
          >
            {REGISTRATION_STATUS_LABELS[item]}
          </Link>
        ))}
        <span className="ml-auto mono text-[11px] text-muted self-center">{total} en total</span>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          title="No hay inscripciones"
          description="No hay inscripciones para el filtro seleccionado."
          compact
        />
      ) : (
        <>
          <div className="space-y-3">
            {registrations.map((registration) => (
              <article key={registration.id} className="panel">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={registration.status} />
                      <span className="mono text-[10px] text-muted">
                        {registration.tournament.name}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium">
                      {registration.team.name}{" "}
                      <span className="mono text-[10px] text-muted">
                        {registration.team.tag}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Capitán: {registration.captain.name} ({registration.captain.email})
                    </p>
                  </div>
                  <p className="mono text-[10px] text-muted">
                    {formatDateTime(registration.createdAt)}
                  </p>
                </div>

                <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <Link
                        href={`/torneos/${registration.tournament.slug}`}
                        className="text-white underline decoration-line underline-offset-4"
                      >
                        Ver torneo
                      </Link>
                      <Link
                        href={`/admin/torneos/${registration.tournament.id}#inscripciones`}
                        className="text-white underline decoration-line underline-offset-4"
                      >
                        Gestionar torneo
                      </Link>
                    </div>
                  </div>
                  {["PENDING", "REJECTED", "CONFIRMED"].includes(
                    registration.status,
                  ) ? (
                    <ActionForm
                      action={adminCancelRegistrationAction}
                      submitLabel="Cancelar inscripción"
                      pendingLabel="Cancelando…"
                      className="space-y-0"
                      buttonClassName="btn btn-danger btn-sm"
                    >
                      <input
                        type="hidden"
                        name="registrationId"
                        value={registration.id}
                      />
                    </ActionForm>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
          <AdminPagination page={page} totalPages={totalPages} buildHref={buildHref} />
        </>
      )}
    </>
  );
}

