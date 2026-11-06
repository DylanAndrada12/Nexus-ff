import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, KeyRound, Trophy } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import {
  getAdminRegistrationTeamOptions,
  getAdminTeamOptionsForInvite,
  getAdminTournament,
} from "@/lib/queries/admin";
import {
  addTournamentRegistrationAction,
  adminCancelRegistrationAction,
  cancelTournamentAction,
  createInviteAction,
  deleteRoomAction,
  deleteTournamentAction,
  publishResultsAction,
  revokeInviteAction,
  saveResultsAction,
  saveRoomAction,
  unpublishResultsAction,
} from "@/actions/admin";
import { ActionForm } from "@/components/forms/action-form";
import { TournamentForm } from "@/components/admin/tournament-form";
import { PageHeader, StatusBadge } from "@/components/ui";
import { formatCurrency, formatDateTime, toArgentinaInput } from "@/lib/format";
import { MODALITY_LABELS, type Modality } from "@/lib/constants";
import { parsePointsConfig } from "@/lib/tournaments";

export const metadata: Metadata = { title: "Gestionar torneo · Administración" };
export const dynamic = "force-dynamic";

export default async function AdminTournamentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ guardado?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const tournament = await getAdminTournament(id);
  if (!tournament) notFound();

  const [inviteCandidates, registrationCandidates] = await Promise.all([
    getAdminTeamOptionsForInvite(tournament.id),
    getAdminRegistrationTeamOptions(tournament.id),
  ]);
  const confirmed = tournament.registrations.filter(
    (registration) => registration.status === "CONFIRMED",
  );
  const points = parsePointsConfig(tournament.pointsConfig);
  const resultByTeam = new Map(
    tournament.results.map((result) => [result.teamId, result]),
  );

  return (
    <>
      <PageHeader
        title={tournament.name}
        description={`${MODALITY_LABELS[tournament.modality as Modality]} · ${formatDateTime(tournament.startsAt)} · ${tournament.maxTeams} cupos`}
        breadcrumb={
          <Link href="/admin/torneos" className="hover:text-white">
            ← Volver a torneos
          </Link>
        }
        actions={
          <>
            <StatusBadge status={tournament.status} />
            <Link
              href={`/torneos/${tournament.slug}`}
              className="btn btn-secondary btn-sm"
              target="_blank"
            >
              Ver página pública <ExternalLink size={13} aria-hidden="true" />
            </Link>
          </>
        }
      />

      {query.guardado === "1" ? (
        <p className="form-message form-message-success mb-6">Torneo guardado.</p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <a href="#editar" className="btn btn-ghost btn-sm">
          Editar
        </a>
        <a href="#sala" className="btn btn-ghost btn-sm">
          Sala
        </a>
        <a href="#invitaciones" className="btn btn-ghost btn-sm">
          Invitaciones
        </a>
        <a href="#inscripciones" className="btn btn-ghost btn-sm">
          Inscripciones
        </a>
        <a href="#resultados" className="btn btn-ghost btn-sm">
          Resultados
        </a>
      </div>

      <section className="panel p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="display text-2xl">Estado del torneo</h2>
            <p className="mt-1 text-xs text-muted">
              {tournament.registrations.length} inscripciones · {confirmed.length}{" "}
              confirmadas · {tournament.results.length} resultados cargados
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tournament.resultsPublishedAt ? (
              <ActionForm
                action={unpublishResultsAction}
                submitLabel="Despublicar resultados"
                pendingLabel="Procesando…"
                className="space-y-0"
                buttonClassName="btn btn-secondary btn-sm"
              >
                <input type="hidden" name="tournamentId" value={tournament.id} />
              </ActionForm>
            ) : (
              <ActionForm
                action={publishResultsAction}
                submitLabel="Publicar resultados"
                pendingLabel="Publicando…"
                className="space-y-0"
                buttonClassName="btn btn-primary btn-sm"
              >
                <input type="hidden" name="tournamentId" value={tournament.id} />
              </ActionForm>
            )}
          </div>
        </div>
        {tournament.resultsPublishedAt ? (
          <p className="mt-3 text-xs text-success">
            Resultados publicados el {formatDateTime(tournament.resultsPublishedAt)}.
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted">
            Los resultados no están publicados: no aparecen en el sitio ni suman al ranking.
          </p>
        )}
      </section>

      <section id="editar" className="mt-8 scroll-mt-24">
        <div className="mb-4 border-b border-line pb-3">
          <h2 className="display text-3xl">Editar torneo</h2>
        </div>
        <TournamentForm tournament={tournament} />
      </section>

      <section id="sala" className="mt-10 scroll-mt-24">
        <div className="mb-4 border-b border-line pb-3">
          <h2 className="display text-3xl">Sala de Free Fire</h2>
          <p className="mt-1 text-xs text-muted">
            Visible solo para capitanes con inscripción confirmada cuando se publica.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="panel p-5">
            <ActionForm
              action={saveRoomAction}
              submitLabel={tournament.room ? "Guardar sala" : "Crear sala"}
              pendingLabel="Guardando…"
              className="space-y-4"
            >
              <input type="hidden" name="tournamentId" value={tournament.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="field">
                  <label className="label">ID de sala</label>
                  <input
                    name="code"
                    required
                    minLength={3}
                    maxLength={60}
                    defaultValue={tournament.room?.code}
                    className="input mono"
                  />
                </div>
                <div className="field">
                  <label className="label">Contraseña</label>
                  <input
                    name="password"
                    required
                    minLength={3}
                    maxLength={60}
                    defaultValue={tournament.room?.password}
                    className="input mono"
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Apertura (hora Argentina)</label>
                <input
                  name="opensAt"
                  type="datetime-local"
                  defaultValue={
                    tournament.room?.opensAt
                      ? toArgentinaInput(tournament.room.opensAt)
                      : toArgentinaInput(tournament.startsAt)
                  }
                  className="input mono"
                />
              </div>
              <div className="field">
                <label className="label">Indicaciones</label>
                <textarea
                  name="instructions"
                  rows={4}
                  maxLength={1000}
                  defaultValue={tournament.room?.instructions}
                  className="textarea"
                  placeholder="Reglas de ingreso, horario de lobby, sanciones por demora."
                />
              </div>
              <label className="flex items-start gap-3 border border-line bg-surface p-3 text-sm">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={tournament.room?.published ?? false}
                  className="checkbox mt-0.5"
                />
                <span>
                  Publicar sala
                  <span className="mt-0.5 block text-[11px] text-muted">
                    Al publicarla se notifica a los capitanes confirmados.
                  </span>
                </span>
              </label>
            </ActionForm>
          </div>

          <div className="space-y-4">
            <div className="panel p-5">
              <div className="flex items-center gap-2 text-muted">
                <KeyRound size={15} aria-hidden="true" />
                <h3 className="mono text-[10px]">Estado actual</h3>
              </div>
              {tournament.room ? (
                <div className="mt-3 space-y-1.5 text-xs">
                  <p>
                    ID: <span className="mono text-white">{tournament.room.code}</span>
                  </p>
                  <p>
                    Clave: <span className="mono text-white">{tournament.room.password}</span>
                  </p>
                  <p className="text-muted">
                    {tournament.room.published ? "Publicada" : "Borrador (no visible)"}
                  </p>
                  {tournament.room.opensAt ? (
                    <p className="text-muted">
                      Apertura: {formatDateTime(tournament.room.opensAt)}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted">Todavía no hay sala cargada.</p>
              )}
            </div>
            {tournament.room ? (
              <div className="panel p-5">
                <p className="text-xs text-muted">
                  Eliminar la sala la quita del panel de los capitanes.
                </p>
                <div className="mt-3">
                  <ActionForm
                    action={deleteRoomAction}
                    submitLabel="Eliminar sala"
                    pendingLabel="Eliminando…"
                    className="space-y-0"
                    buttonClassName="btn btn-danger btn-sm"
                  >
                    <input type="hidden" name="tournamentId" value={tournament.id} />
                  </ActionForm>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section id="invitaciones" className="mt-10 scroll-mt-24">
        <div className="mb-4 border-b border-line pb-3">
          <h2 className="display text-3xl">Invitaciones</h2>
          <p className="mt-1 text-xs text-muted">
            {tournament.access === "PRIVATE"
              ? "Torneo privado: solo los equipos invitados o con código pueden inscribirse."
              : "Este torneo es público. Las invitaciones no son necesarias."}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="panel p-5">
            <ActionForm
              action={createInviteAction}
              submitLabel="Invitar equipo"
              pendingLabel="Invitando…"
              className="space-y-4"
            >
              <input type="hidden" name="tournamentId" value={tournament.id} />
              <div className="field">
                <label className="label">Equipo</label>
                <select name="teamId" className="select" required>
                  <option value="">Elegí un equipo…</option>
                  {inviteCandidates.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.tag}) · {team.members} jugadores
                    </option>
                  ))}
                </select>
                <span className="hint">
                  Solo se listan equipos de la misma modalidad, activos y sin inscripción en
                  este torneo.
                </span>
              </div>
            </ActionForm>
            {tournament.inviteCode ? (
              <div className="mt-4 border-t border-line pt-4">
                <p className="mono text-[10px] text-muted">Código de acceso</p>
                <p className="mono mt-1 text-lg">{tournament.inviteCode}</p>
                <p className="mt-1 text-[11px] text-muted">
                  Los capitanes pueden canjearlo desde su panel.
                </p>
              </div>
            ) : null}
          </div>

          <div className="panel p-5">
            <h3 className="mono text-[10px] text-muted">Equipos invitados</h3>
            {tournament.invites.length === 0 ? (
              <p className="mt-3 text-xs text-muted">Sin invitaciones cargadas.</p>
            ) : (
              <ul className="mt-2 divide-y divide-line-soft">
                {tournament.invites.map((invite) => (
                  <li key={invite.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{invite.team.name}</p>
                      <p className="mono text-[10px] text-muted">
                        {invite.team.tag} · {invite.team.captain.name}
                      </p>
                    </div>
                    <ActionForm
                      action={revokeInviteAction}
                      submitLabel="Revocar"
                      pendingLabel="Revocando…"
                      className="space-y-0"
                      buttonClassName="btn btn-danger btn-sm"
                    >
                      <input type="hidden" name="inviteId" value={invite.id} />
                    </ActionForm>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section id="inscripciones" className="mt-10 scroll-mt-24">
        <div className="mb-4 border-b border-line pb-3">
          <h2 className="display text-3xl">Inscripciones</h2>
          <p className="mt-1 text-xs text-muted">
            Agregá los equipos que confirmaron por WhatsApp. Cancelar una inscripción libera
            el cupo y notifica al capitán.
          </p>
        </div>

        {registrationCandidates.length > 0 ? (
          <div className="panel mb-4 p-4 md:p-5">
            <ActionForm
              action={addTournamentRegistrationAction}
              submitLabel="Agregar equipo"
              pendingLabel="Agregando…"
              className="gap-3 sm:flex sm:items-end"
            >
              <input type="hidden" name="tournamentId" value={tournament.id} />
              <div className="field min-w-0 flex-1">
                <label className="label">Equipo confirmado</label>
                <select name="teamId" className="select" required>
                  <option value="">Elegí un equipo…</option>
                  {registrationCandidates.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.tag}) · {team.members} jugadores
                    </option>
                  ))}
                </select>
              </div>
            </ActionForm>
          </div>
        ) : null}

        {tournament.registrations.length === 0 ? (
          <div className="border border-line bg-surface p-5 text-sm text-muted">
            Todavía no hay inscripciones.
          </div>
        ) : (
          <div className="space-y-3">
            {tournament.registrations.map((registration) => (
              <article key={registration.id} className="panel">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={registration.status} />
                      <span className="mono text-[10px] text-muted">
                        {registration.team.tag}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{registration.team.name}</p>
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
                    <p className="mono text-[10px] text-muted">Plantilla</p>
                    <p className="mt-1 text-xs text-muted">
                      {registration.team.members
                        .map(
                          (member) =>
                            `${member.gameName} (${member.uid})${
                              member.role === "SUPLENTE" ? " [sup]" : ""
                            }`,
                        )
                        .join(" · ")}
                    </p>
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
                      <input type="hidden" name="registrationId" value={registration.id} />
                    </ActionForm>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="resultados" className="mt-10 scroll-mt-24">
        <div className="mb-4 border-b border-line pb-3">
          <h2 className="display text-3xl">Acta de resultados</h2>
          <p className="mt-1 text-xs text-muted">
            Puntos automáticos: {points.killPoints} por kill y{" "}
            {points.placements.join(" / ")} por posición. Solo se incluyen equipos
            confirmados.
          </p>
        </div>

        {confirmed.length === 0 ? (
          <div className="border border-line bg-surface p-5 text-sm text-muted">
            No hay equipos confirmados para cargar resultados.
          </div>
        ) : (
          <div className="panel p-5">
            <ActionForm
              action={saveResultsAction}
              submitLabel="Guardar acta"
              pendingLabel="Guardando…"
              className="space-y-4"
            >
              <input type="hidden" name="tournamentId" value={tournament.id} />
              <div className="space-y-3">
                {confirmed.map((registration) => {
                  const existing = resultByTeam.get(registration.team.id);
                  return (
                    <div
                      key={registration.id}
                      className="grid gap-3 border border-line bg-surface p-3 md:grid-cols-[1.4fr_90px_90px_120px_1fr] md:items-end"
                    >
                      <div>
                        <p className="text-sm font-medium">{registration.team.name}</p>
                        <p className="mono text-[10px] text-muted">
                          {registration.team.tag}
                        </p>
                      </div>
                      <div className="field">
                        <label className="hint">Posición</label>
                        <input
                          name={`position_${registration.team.id}`}
                          type="number"
                          min={1}
                          max={confirmed.length}
                          required
                          defaultValue={existing?.position ?? ""}
                          className="input mono"
                        />
                      </div>
                      <div className="field">
                        <label className="hint">Kills</label>
                        <input
                          name={`kills_${registration.team.id}`}
                          type="number"
                          min={0}
                          max={999}
                          defaultValue={existing?.kills ?? 0}
                          className="input mono"
                        />
                      </div>
                      <div className="field">
                        <label className="hint">Premio (ARS)</label>
                        <input
                          name={`prize_${registration.team.id}`}
                          type="number"
                          min={0}
                          defaultValue={existing?.prize ?? 0}
                          className="input mono"
                        />
                      </div>
                      <div className="field">
                        <label className="hint">MVP (opcional)</label>
                        <input
                          name={`mvp_${registration.team.id}`}
                          maxLength={60}
                          defaultValue={existing?.mvpName ?? ""}
                          className="input"
                          placeholder="Nombre del jugador"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ActionForm>
            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              El acta debe cubrir todas las posiciones del 1° al {confirmed.length}° sin
              repetir. La suma de premios no puede superar el premio total del torneo.
            </p>
          </div>
        )}

        {tournament.results.length > 0 ? (
          <div className="mt-5 table-wrap border border-line bg-surface">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pos.</th>
                  <th>Equipo</th>
                  <th className="text-right">Kills</th>
                  <th className="text-right">Puntos</th>
                  <th className="text-right">Premio</th>
                  <th>MVP</th>
                </tr>
              </thead>
              <tbody>
                {tournament.results.map((result) => (
                  <tr key={result.id}>
                    <td className="mono">{result.position}°</td>
                    <td>{result.team.name}</td>
                    <td className="mono text-right">{result.kills}</td>
                    <td className="mono text-right">{result.points}</td>
                    <td className="mono text-right">{formatCurrency(result.prize)}</td>
                    <td className="text-xs text-muted">{result.mvpName ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="mt-10 grid gap-6 border-t border-line pt-8 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-muted">
            <Trophy size={15} aria-hidden="true" />
            <h2 className="mono text-[10px]">Cancelar torneo</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            El torneo deja de aceptar inscripciones y se notifica a los capitanes
            confirmados.
          </p>
          <div className="mt-4">
            <ActionForm
              action={cancelTournamentAction}
              submitLabel="Cancelar torneo"
              pendingLabel="Cancelando…"
              className="space-y-0"
              buttonClassName="btn btn-danger btn-sm"
            >
              <input type="hidden" name="tournamentId" value={tournament.id} />
            </ActionForm>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="mono text-[10px] text-muted">Eliminar torneo</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Solo se puede eliminar si no tiene inscripciones ni resultados. Para torneos con
            historial, usá la cancelación.
          </p>
          <div className="mt-4">
            <ActionForm
              action={deleteTournamentAction}
              submitLabel="Eliminar definitivamente"
              pendingLabel="Eliminando…"
              className="space-y-0"
              buttonClassName="btn btn-danger btn-sm"
            >
              <input type="hidden" name="tournamentId" value={tournament.id} />
            </ActionForm>
          </div>
        </div>
      </section>
    </>
  );
}
