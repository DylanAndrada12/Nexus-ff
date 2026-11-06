import type { Tournament } from "@prisma/client";
import { saveTournamentAction } from "@/actions/admin";
import { ActionForm } from "@/components/forms/action-form";
import { ImageUploadField } from "@/components/forms/image-upload-field";
import {
  MODALITIES,
  MODALITY_LABELS,
  TOURNAMENT_ACCESS,
  TOURNAMENT_FORMATS,
  TOURNAMENT_FORMAT_LABELS,
  TOURNAMENT_STATUSES,
  TOURNAMENT_STATUS_LABELS,
  type Modality,
  type TournamentAccess,
  type TournamentFormat,
  type TournamentStatus,
} from "@/lib/constants";
import { toArgentinaInput } from "@/lib/format";
import { daysFromNow } from "@/lib/time";
import { parsePointsConfig, parsePrizeDistribution } from "@/lib/tournaments";

export function TournamentForm({ tournament }: { tournament?: Tournament | null }) {
  const points = parsePointsConfig(tournament?.pointsConfig);
  const prizes = parsePrizeDistribution(tournament?.prizeDistribution);
  const prizeAmount = (position: number) =>
    prizes.find((prize) => prize.position === position)?.amount ?? "";

  const defaultStart = toArgentinaInput(
    tournament?.startsAt ?? daysFromNow(7),
  );
  const defaultClose = tournament?.registrationClosesAt
    ? toArgentinaInput(tournament.registrationClosesAt)
    : "";

  return (
    <ActionForm
      action={saveTournamentAction}
      submitLabel={tournament ? "Guardar torneo" : "Crear torneo"}
      pendingLabel="Guardando…"
      className="space-y-6"
    >
      {tournament ? <input type="hidden" name="id" value={tournament.id} /> : null}

      <section className="panel p-5 md:p-6">
        <h2 className="display text-2xl">Datos generales</h2>
        <div className="mt-4 grid gap-5">
          <div className="field">
            <label className="label" htmlFor="tournament-name">
              Nombre del torneo
            </label>
            <input
              id="tournament-name"
              name="name"
              required
              minLength={4}
              maxLength={80}
              defaultValue={tournament?.name}
              className="input"
              placeholder="Ej.: NEXUS FF Copa Invierno 2026"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="tournament-description">
              Descripción pública
            </label>
            <textarea
              id="tournament-description"
              name="description"
              required
              minLength={20}
              maxLength={2000}
              defaultValue={tournament?.description}
              className="textarea"
              rows={4}
              placeholder="Qué se juega, quién puede participar, qué incluye la inscripción."
            />
          </div>
          <ImageUploadField
            name="bannerUrl"
            label="Banner (opcional)"
            initialUrl={tournament?.bannerUrl}
            hint="PNG, JPG o WEBP. Máximo 2 MB. Se muestra en la página del torneo."
            aspect="wide"
          />
        </div>
      </section>

      <section className="panel p-5 md:p-6">
        <h2 className="display text-2xl">Competencia</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="field">
            <label className="label" htmlFor="tournament-modality">
              Modalidad
            </label>
            <select
              id="tournament-modality"
              name="modality"
              className="select"
              defaultValue={tournament?.modality ?? "SQUAD"}
            >
              {MODALITIES.map((modality: Modality) => (
                <option key={modality} value={modality}>
                  {MODALITY_LABELS[modality]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="tournament-format">
              Formato
            </label>
            <select
              id="tournament-format"
              name="format"
              className="select"
              defaultValue={tournament?.format ?? "POINTS"}
            >
              {TOURNAMENT_FORMATS.map((format: TournamentFormat) => (
                <option key={format} value={format}>
                  {TOURNAMENT_FORMAT_LABELS[format]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="tournament-access">
              Tipo de acceso
            </label>
            <select
              id="tournament-access"
              name="access"
              className="select"
              defaultValue={tournament?.access ?? "PUBLIC"}
            >
              {TOURNAMENT_ACCESS.map((access: TournamentAccess) => (
                <option key={access} value={access}>
                  {access === "PUBLIC" ? "Público" : "Privado (invitación/código)"}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="tournament-status">
              Estado
            </label>
            <select
              id="tournament-status"
              name="status"
              className="select"
              defaultValue={tournament?.status ?? "UPCOMING"}
            >
              {TOURNAMENT_STATUSES.map((status: TournamentStatus) => (
                <option key={status} value={status}>
                  {TOURNAMENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="tournament-starts">
              Inicio (hora Argentina)
            </label>
            <input
              id="tournament-starts"
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={defaultStart}
              className="input mono"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="tournament-closes">
              Cierre de inscripción (opcional)
            </label>
            <input
              id="tournament-closes"
              name="registrationClosesAt"
              type="datetime-local"
              defaultValue={defaultClose}
              className="input mono"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="tournament-rounds">
              Cantidad de partidas / rondas
            </label>
            <input
              id="tournament-rounds"
              name="rounds"
              type="number"
              min={1}
              max={50}
              defaultValue={tournament?.rounds ?? points.matches ?? 1}
              className="input mono"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="tournament-format-details">
              Detalle del formato (opcional)
            </label>
            <input
              id="tournament-format-details"
              name="formatDetails"
              maxLength={500}
              defaultValue={tournament?.formatDetails}
              className="input"
              placeholder="Ej.: 6 partidas en Bermuda y Purgatorio."
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex items-start gap-3 border border-line bg-surface p-3 text-sm">
            <input
              type="checkbox"
              name="allowSubstitutes"
              defaultChecked={tournament?.allowSubstitutes ?? false}
              className="checkbox mt-0.5"
            />
            <span>
              Permitir suplentes
              <span className="mt-0.5 block text-[11px] text-muted">
                Hasta 2 por equipo. Si está desactivado, la plantilla debe ser exacta.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 border border-line bg-surface p-3 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={tournament?.featured ?? false}
              className="checkbox mt-0.5"
            />
            <span>
              Destacar en la landing
              <span className="mt-0.5 block text-[11px] text-muted">
                Se usa como torneo principal en la portada.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5 field">
          <label className="label" htmlFor="tournament-invite-code">
            Código de acceso privado (opcional)
          </label>
          <input
            id="tournament-invite-code"
            name="inviteCode"
            maxLength={20}
            defaultValue={tournament?.inviteCode ?? ""}
            className="input mono uppercase"
            placeholder="Se genera automáticamente si se deja vacío"
          />
          <span className="hint">
            Solo aplica a torneos privados. Los capitanes pueden canjearlo desde su panel.
          </span>
        </div>
      </section>

      <section className="panel p-5 md:p-6">
        <h2 className="display text-2xl">Inscripción por WhatsApp</h2>
        <p className="mt-1 text-xs text-muted">
          Este enlace se usa en el botón de inscripción de la página pública del torneo.
        </p>
        <div className="field mt-4">
          <label className="label" htmlFor="tournament-whatsapp">
            Enlace del grupo de WhatsApp
          </label>
          <input
            id="tournament-whatsapp"
            name="whatsappUrl"
            type="url"
            defaultValue={tournament?.whatsappUrl ?? ""}
            className="input"
            placeholder="https://chat.whatsapp.com/..."
          />
          <span className="hint">
            Si queda vacío, la inscripción se muestra como no disponible.
          </span>
        </div>
      </section>

      <section className="panel p-5 md:p-6">
        <h2 className="display text-2xl">Cupos y premios</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="field">
            <label className="label" htmlFor="tournament-max">
              Máximo de equipos
            </label>
            <input
              id="tournament-max"
              name="maxTeams"
              type="number"
              min={2}
              max={256}
              required
              defaultValue={tournament?.maxTeams ?? 16}
              className="input mono"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="tournament-prize">
              Premio total (ARS)
            </label>
            <input
              id="tournament-prize"
              name="prizePool"
              type="number"
              min={0}
              step={1}
              defaultValue={tournament?.prizePool ?? 0}
              className="input mono"
            />
            <span className="hint">La suma distribuida no puede superarlo.</span>
          </div>
        </div>

        <div className="mt-5">
          <p className="label">Distribución de premios (opcional)</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-5">
            {[1, 2, 3, 4, 5].map((position) => (
              <div key={position} className="field">
                <label className="hint" htmlFor={`prize_${position}`}>
                  {position}° puesto
                </label>
                <input
                  id={`prize_${position}`}
                  name={`prize_${position}`}
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={prizeAmount(position)}
                  className="input mono"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel p-5 md:p-6">
        <h2 className="display text-2xl">Puntaje por puntos</h2>
        <p className="mt-1 text-xs text-muted">
          Se usa para calcular automáticamente los puntos de cada equipo al cargar el acta.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-[160px_180px_1fr]">
          <div className="field">
            <label className="label" htmlFor="tournament-kill-points">
              Puntos por kill
            </label>
            <input
              id="tournament-kill-points"
              name="killPoints"
              type="number"
              min={0}
              step={1}
              defaultValue={points.killPoints}
              className="input mono"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="tournament-tiebreaker">
              Criterio de desempate
            </label>
            <select
              id="tournament-tiebreaker"
              name="tiebreaker"
              defaultValue={points.tiebreaker}
              className="select"
            >
              <option value="POINTS">Puntos totales</option>
              <option value="KILLS">Eliminaciones</option>
              <option value="BEST_PLACEMENT">Mejor posición</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <p className="label">Puntos por posición</p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 10 }, (_, index) => (
              <div key={index} className="field">
                <label className="hint" htmlFor={`placement_${index + 1}`}>
                  {index + 1}°
                </label>
                <input
                  id={`placement_${index + 1}`}
                  name={`placement_${index + 1}`}
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={points.placements[index] ?? 0}
                  className="input mono"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel p-5 md:p-6">
        <h2 className="display text-2xl">Reglamento</h2>
        <div className="field mt-4">
          <label className="label" htmlFor="tournament-rules">
            Texto público del reglamento
          </label>
          <textarea
            id="tournament-rules"
            name="rules"
            maxLength={8000}
            rows={8}
            defaultValue={tournament?.rules}
            className="textarea"
            placeholder="Requisitos, prohibiciones, sanciones, criterios de desempate y cualquier condición relevante."
          />
          <span className="hint">Se muestra tal cual en la página del torneo, respetando saltos de línea.</span>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted">
          Los cambios de modalidad se bloquean si hay inscripciones activas.
        </span>
      </div>
    </ActionForm>
  );
}
