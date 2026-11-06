import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminTeam } from "@/lib/queries/admin";
import { adminUpdateTeamAction } from "@/actions/admin";
import { ActionForm } from "@/components/forms/action-form";
import { ImageUploadField } from "@/components/forms/image-upload-field";
import { KeyValue, PageHeader, StatusBadge } from "@/components/ui";
import {
  MAX_SUBSTITUTES,
  MODALITY_LABELS,
  MODALITY_SIZE,
  type Modality,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Detalle de equipo · Administración" };
export const dynamic = "force-dynamic";

export default async function AdminTeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const team = await getAdminTeam(id);
  if (!team) notFound();

  const required = MODALITY_SIZE[team.modality as Modality] ?? 1;
  const titulares = team.members.filter((member) => member.role === "TITULAR");
  const suplentes = team.members.filter((member) => member.role === "SUPLENTE");

  return (
    <>
      <PageHeader
        title={team.name}
        description={`${team.tag} · ${MODALITY_LABELS[team.modality as Modality]} · Capitán: ${team.captain.name}`}
        breadcrumb={
          <Link href="/admin/equipos" className="hover:text-white">
            ← Volver a equipos
          </Link>
        }
        actions={
          team.suspended ? (
            <StatusBadge status="REJECTED" />
          ) : (
            <StatusBadge status="CONFIRMED" />
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-6">
          <div className="flex items-center gap-4">
            {team.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={team.logoUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-[8px] border border-line object-cover"
              />
            ) : (
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[8px] border border-line bg-card text-sm text-muted">
                {team.tag.slice(0, 2)}
              </span>
            )}
            <div>
              <p className="mono text-[10px] text-muted">Equipo</p>
              <p className="mt-1 text-xl font-semibold">{team.name}</p>
              <p className="mono mt-1 text-[11px] text-muted">
                {team.tag} · {MODALITY_LABELS[team.modality as Modality]}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mono text-[10px] text-muted">Plantilla</h2>
            <div className="mt-2 divide-y divide-line border border-line">
              {team.members.map((member) => (
                <div key={member.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        {member.gameName}
                        {member.userId === team.captainId ? (
                          <span className="mono ml-2 text-[10px] text-muted">CAPITÁN</span>
                        ) : null}
                      </p>
                      <p className="mono mt-0.5 text-[10px] text-muted">
                        UID {member.uid} ·{" "}
                        {member.role === "TITULAR" ? "Titular" : "Suplente"}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-muted">
                      {member.user ? (
                        <>
                          <p className="text-white/80">{member.user.name}</p>
                          <p>{member.user.email}</p>
                        </>
                      ) : (
                        <p>Sin cuenta vinculada</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mono text-[10px] text-muted">Inscripciones</h2>
            {team.registrations.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                El equipo todavía no se inscribió en ningún torneo.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-line border border-line">
                {team.registrations.map((registration) => (
                  <li key={registration.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/torneos/${registration.tournament.slug}`}
                          className="block truncate text-sm hover:underline"
                        >
                          {registration.tournament.name}
                        </Link>
                        <p className="mono mt-0.5 text-[10px] text-muted">
                          {formatDateTime(registration.tournament.startsAt)}
                        </p>
                      </div>
                      <StatusBadge status={registration.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="panel p-5">
            <h2 className="mono text-[10px] text-muted">Datos</h2>
            <div className="mt-2">
              <KeyValue label="Capitán" value={team.captain.name} />
              <KeyValue label="Email" value={team.captain.email} />
              <KeyValue label="Alta" value={formatDateTime(team.createdAt)} />
              <KeyValue
                label="Titulares"
                value={`${titulares.length} / ${required}`}
                mono
              />
              <KeyValue
                label="Suplentes"
                value={`${suplentes.length} / ${MAX_SUBSTITUTES}`}
                mono
              />
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="display text-2xl">Editar equipo</h2>
            <p className="mt-1 text-xs text-muted">
              La suspensión impide nuevas inscripciones del equipo. Las inscripciones ya
              confirmadas no se modifican automáticamente.
            </p>
            <div className="mt-4">
              <ActionForm
                action={adminUpdateTeamAction}
                submitLabel="Guardar cambios"
                pendingLabel="Guardando…"
                className="space-y-4"
              >
                <input type="hidden" name="teamId" value={team.id} />
                <div className="field">
                  <label className="label">Nombre</label>
                  <input
                    name="name"
                    defaultValue={team.name}
                    required
                    minLength={3}
                    maxLength={30}
                    className="input"
                  />
                </div>
                <div className="field">
                  <label className="label">Etiqueta</label>
                  <input
                    name="tag"
                    defaultValue={team.tag}
                    required
                    minLength={2}
                    maxLength={5}
                    className="input uppercase"
                  />
                </div>
                <ImageUploadField
                  name="logoUrl"
                  label="Logo"
                  initialUrl={team.logoUrl}
                />
                <label className="flex items-start gap-3 border border-line bg-surface p-3 text-sm">
                  <input
                    type="checkbox"
                    name="suspended"
                    defaultChecked={team.suspended}
                    className="checkbox mt-0.5"
                  />
                  <span>
                    Equipo suspendido
                    <span className="mt-0.5 block text-[11px] text-muted">
                      No puede inscribirse en nuevos torneos mientras esté suspendido.
                    </span>
                  </span>
                </label>
              </ActionForm>
            </div>
          </section>

        </aside>
      </div>
    </>
  );
}
