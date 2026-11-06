import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { getCaptainRegistrations } from "@/lib/queries/captain";
import { formatDateTime } from "@/lib/format";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Mis inscripciones" };
export const dynamic = "force-dynamic";

export default async function RegistrationsPage() {
  const user = await requireUser("/panel/inscripciones");
  const registrations = await getCaptainRegistrations(user.id);

  return (
    <>
      <PageHeader
        title="Mis inscripciones"
        description="Equipos confirmados por la organización y acceso a las salas de cada torneo."
        actions={
          <Link href="/panel/torneos" className="btn btn-secondary btn-sm">
            Buscar torneo
          </Link>
        }
      />

      {registrations.length === 0 ? (
        <EmptyState
          title="No tenés inscripciones"
          description="Entrá al torneo que te interesa y uníte al grupo de WhatsApp. La organización confirma tu cupo desde administración."
          action={{ href: "/panel/torneos", label: "Ver torneos" }}
        />
      ) : (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <article key={registration.id} className="panel">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={registration.status} />
                    <span className="mono text-[10px] text-muted">
                      {registration.tournament.access === "PRIVATE" ? "Privado" : "Público"}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">
                    {registration.tournament.name}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {registration.team.name} ({registration.team.tag}) ·{" "}
                    {formatDateTime(registration.tournament.startsAt)}
                  </p>
                </div>
                <span className="mono text-[10px] text-muted">
                  {formatDateTime(registration.createdAt)}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                {registration.status === "CONFIRMED" &&
                registration.tournament.room?.published ? (
                  <p className="text-xs text-success">
                    La sala ya está publicada en{" "}
                    <Link href="/panel/salas" className="underline underline-offset-4">
                      Salas
                    </Link>
                    .
                  </p>
                ) : (
                  <p className="text-xs text-muted">
                    La organización va a avisar por WhatsApp cuando esté todo listo.
                  </p>
                )}
                <Link
                  href={`/torneos/${registration.tournament.slug}`}
                  className="btn btn-ghost btn-sm"
                >
                  Ver torneo
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
