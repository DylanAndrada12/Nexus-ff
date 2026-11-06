import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { getTeamDetail } from "@/lib/queries/captain";
import {
  addTeamMemberAction,
  deleteTeamAction,
  removeTeamMemberAction,
  updateTeamAction,
  updateTeamMemberAction,
} from "@/actions/teams";
import { ActionForm } from "@/components/forms/action-form";
import { ImageUploadField } from "@/components/forms/image-upload-field";
import {
  EmptyState,
  KeyValue,
  PageHeader,
  StatusBadge,
} from "@/components/ui";
import {
  MAX_SUBSTITUTES,
  MODALITIES,
  MODALITY_LABELS,
  MODALITY_SIZE,
  type Modality,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Detalle del equipo" };
export const dynamic = "force-dynamic";

export default async function TeamDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creado?: string; editado?: string }>;
}) {
  const user = await requireUser("/panel/equipos");
  const { id } = await params;
  const query = await searchParams;
  const result = await getTeamDetail(id, user);
  if (!result) notFound();

  const { team, canManage } = result;
  const activeRegistration = team.registrations.find((registration) =>
    ["PENDING", "CONFIRMED"].includes(registration.status),
  );
  const editable = canManage && !activeRegistration;
  const required = MODALITY_SIZE[team.modality as Modality] ?? 1;
  const titulares = team.members.filter((member) => member.role === "TITULAR");
  const suplentes = team.members.filter((member) => member.role === "SUPLENTE");
  const canAddTitular = titulares.length < required;
  const canAddSubstitute = suplentes.length < MAX_SUBSTITUTES;
  const canAddMember =
    editable && (canAddTitular || canAddSubstitute);

  return (
    <>
      <PageHeader
        title={team.name}
        description={`${team.tag} · ${MODALITY_LABELS[team.modality as Modality]} · Capitán: ${team.captain.name}`}
        breadcrumb={
          <Link href="/panel/equipos" className="hover:text-white">
            ← Volver a mis equipos
          </Link>
        }
        actions={
          canManage ? (
            <Link href="/panel/equipos/nuevo" className="btn btn-secondary btn-sm">
              Crear otro equipo
            </Link>
          ) : undefined
        }
      />

      {query.creado === "1" ? (
        <p className="form-message form-message-success mb-6">
          Equipo creado. Completá la plantilla para poder inscribirte en un torneo.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
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
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{team.name}</h2>
                  {team.suspended ? (
                    <StatusBadge status="REJECTED" />
                  ) : (
                    <StatusBadge status="CONFIRMED" />
                  )}
                </div>
                <p className="mono mt-1 text-[11px] text-muted">
                  {team.tag} · {MODALITY_LABELS[team.modality as Modality]}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Creado el {formatDateTime(team.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mono text-[10px] text-muted">Plantilla</h3>
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
                        UID {member.uid} · {member.role === "TITULAR" ? "Titular" : "Suplente"}
                        {member.user ? ` · ${member.user.email}` : " · Sin cuenta vinculada"}
                      </p>
                    </div>
                    {editable ? (
                      <div className="flex items-center gap-3">
                        <details className="group">
                          <summary className="cursor-pointer text-xs text-muted hover:text-white">
                            Editar
                          </summary>
                          <div className="mt-3 w-full min-w-0 border border-line bg-surface p-4 sm:min-w-[320px]">
                            <ActionForm
                              action={updateTeamMemberAction}
                              submitLabel="Guardar jugador"
                              pendingLabel="Guardando…"
                              className="space-y-3"
                            >
                              <input type="hidden" name="memberId" value={member.id} />
                              <div className="field">
                                <label className="label">Nombre en el juego</label>
                                <input
                                  name="gameName"
                                  defaultValue={member.gameName}
                                  required
                                  minLength={2}
                                  maxLength={24}
                                  className="input"
                                />
                              </div>
                              <div className="field">
                                <label className="label">UID</label>
                                <input
                                  name="uid"
                                  defaultValue={member.uid}
                                  required
                                  pattern="[0-9]{6,20}"
                                  className="input mono"
                                />
                              </div>
                              <div className="field">
                                <label className="label">Rol</label>
                                <select
                                  name="role"
                                  defaultValue={member.role}
                                  className="select"
                                >
                                  <option value="TITULAR">Titular</option>
                                  <option value="SUPLENTE">Suplente</option>
                                </select>
                              </div>
                              <div className="field">
                                <label className="label">Email de la cuenta (opcional)</label>
                                <input
                                  name="email"
                                  type="email"
                                  defaultValue={member.user?.email ?? ""}
                                  className="input"
                                />
                              </div>
                            </ActionForm>
                          </div>
                        </details>
                        {member.userId !== team.captainId ? (
                          <ActionForm
                            action={removeTeamMemberAction}
                            submitLabel="Quitar"
                            pendingLabel="Quitando…"
                            className="space-y-0"
                            buttonClassName="btn btn-danger btn-sm"
                          >
                            <input type="hidden" name="memberId" value={member.id} />
                          </ActionForm>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            {activeRegistration ? (
              <p className="mt-3 text-xs text-warning">
                La plantilla está bloqueada porque el equipo tiene una inscripción activa
                en {activeRegistration.tournament.name}.
              </p>
            ) : null}
          </div>

          {canAddMember ? (
            <details className="mt-6 border border-line bg-surface">
              <summary className="cursor-pointer px-4 py-3 text-sm hover:text-white">
                Agregar jugador a la plantilla
              </summary>
              <div className="border-t border-line p-4">
                <ActionForm
                  action={addTeamMemberAction}
                  submitLabel="Agregar jugador"
                  pendingLabel="Agregando…"
                  className="space-y-4"
                >
                  <input type="hidden" name="teamId" value={team.id} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="field">
                      <label className="label">Nombre en el juego</label>
                      <input
                        name="gameName"
                        required
                        minLength={2}
                        maxLength={24}
                        className="input"
                        placeholder="Nick del jugador"
                      />
                    </div>
                    <div className="field">
                      <label className="label">UID</label>
                      <input
                        name="uid"
                        required
                        pattern="[0-9]{6,20}"
                        className="input mono"
                        placeholder="123456789"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="field">
                      <label className="label">Rol</label>
                      <select name="role" className="select">
                        {canAddTitular ? <option value="TITULAR">Titular</option> : null}
                        {canAddSubstitute ? <option value="SUPLENTE">Suplente</option> : null}
                      </select>
                      <span className="hint">
                        {required - titulares.length} titulares pendientes ·{" "}
                        {MAX_SUBSTITUTES - suplentes.length} suplentes disponibles.
                      </span>
                    </div>
                    <div className="field">
                      <label className="label">Email de la cuenta (opcional)</label>
                      <input name="email" type="email" className="input" />
                      <span className="hint">
                        Solo si el jugador ya tiene cuenta en NEXUS FF.
                      </span>
                    </div>
                  </div>
                </ActionForm>
              </div>
            </details>
          ) : null}
        </section>

        <aside className="space-y-6">
          <section className="panel p-5">
            <h2 className="mono text-[10px] text-muted">Configuración</h2>
            <div className="mt-2">
              <KeyValue label="Modalidad" value={MODALITY_LABELS[team.modality as Modality]} />
              <KeyValue label="Titulares" value={`${titulares.length} / ${required}`} mono />
              <KeyValue label="Suplentes" value={`${suplentes.length} / ${MAX_SUBSTITUTES}`} mono />
              <KeyValue label="UID únicos" value={`${team.members.length}`} mono />
            </div>
            {titulares.length !== required ? (
              <p className="mt-3 text-xs text-warning">
                Faltan titulares para cumplir la modalidad. No vas a poder inscribir el
                equipo hasta completarla.
              </p>
            ) : null}
          </section>

          {team.registrations.length > 0 ? (
            <section className="panel p-5">
              <h2 className="mono text-[10px] text-muted">Inscripciones</h2>
              <ul className="mt-2 divide-y divide-line-soft">
                {team.registrations.map((registration) => (
                  <li key={registration.id} className="py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/torneos/${registration.tournament.slug}`}
                          className="block truncate text-sm hover:underline"
                        >
                          {registration.tournament.name}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {formatDateTime(registration.tournament.startsAt)}
                        </p>
                      </div>
                      <StatusBadge status={registration.status} />
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/panel/inscripciones"
                className="mt-3 inline-flex text-xs text-white underline decoration-line underline-offset-4 hover:decoration-white"
              >
                Gestionar inscripciones
              </Link>
            </section>
          ) : null}

          {editable ? (
            <details className="panel">
              <summary className="cursor-pointer px-5 py-4 text-sm hover:text-white">
                Editar datos del equipo
              </summary>
              <div className="border-t border-line p-5">
                <ActionForm
                  action={updateTeamAction}
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
                  <div className="field">
                    <label className="label">Modalidad</label>
                    <select name="modality" defaultValue={team.modality} className="select">
                      {MODALITIES.map((modality) => (
                        <option key={modality} value={modality}>
                          {MODALITY_LABELS[modality]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ImageUploadField
                    name="logoUrl"
                    label="Logo"
                    initialUrl={team.logoUrl}
                  />
                  {team.registrations.some((registration) =>
                    ["PENDING", "CONFIRMED"].includes(registration.status),
                  ) ? (
                    <p className="text-xs text-warning">
                      No podés cambiar la modalidad mientras haya inscripciones activas.
                    </p>
                  ) : null}
                </ActionForm>
              </div>
            </details>
          ) : null}

          {canManage && team.registrations.length === 0 ? (
            <details className="panel">
              <summary className="cursor-pointer px-5 py-4 text-sm text-danger hover:text-white">
                Eliminar equipo
              </summary>
              <div className="border-t border-line p-5">
                <p className="text-xs leading-relaxed text-muted">
                  El equipo se elimina de forma permanente. Solo es posible si nunca tuvo
                  inscripciones ni resultados.
                </p>
                <div className="mt-4">
                  <ActionForm
                    action={deleteTeamAction}
                    submitLabel="Eliminar definitivamente"
                    pendingLabel="Eliminando…"
                    buttonClassName="btn btn-danger btn-sm"
                    className="space-y-0"
                  >
                    <input type="hidden" name="teamId" value={team.id} />
                  </ActionForm>
                </div>
              </div>
            </details>
          ) : null}

          {!canManage ? (
            <EmptyState
              title="Solo lectura"
              description="Formás parte de este equipo, pero solo el capitán puede editar la plantilla."
              compact
            />
          ) : null}
        </aside>
      </div>
    </>
  );
}
