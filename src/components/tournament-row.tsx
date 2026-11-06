import Link from "next/link";
import { ChevronRight, Swords, Trophy } from "lucide-react";
import { formatCurrency, formatTime } from "@/lib/format";
import { MODALITY_LABELS, type Modality } from "@/lib/constants";
import type { TournamentCard } from "@/lib/queries/public";
import { StatusBadge } from "@/components/ui";

const monthFormatter = new Intl.DateTimeFormat("es-AR", {
  month: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});
const dayFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});
export function TournamentRow({
  tournament,
  showStatus = true,
}: {
  tournament: TournamentCard;
  showStatus?: boolean;
}) {
  const date = new Date(tournament.startsAt);
  const occupiedPercent = Math.min(
    100,
    Math.round((tournament.occupancy.occupied / tournament.maxTeams) * 100),
  );
  const prize =
    tournament.prizePool > 0 ? formatCurrency(tournament.prizePool) : "A definir";

  return (
    <Link href={`/torneos/${tournament.slug}`} className="tournament-item group">
      <div className="tournament-date">
        <div className="tournament-date-day">{dayFormatter.format(date)}</div>
        <div className="mono mt-1 text-[8.5px] uppercase tracking-[0.12em] text-muted">
          {monthFormatter.format(date).replace(".", "")}
        </div>
        <div className="mono mt-1 text-[9px] text-[#7c6f74]">{formatTime(date)}</div>
      </div>

      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <span className="tournament-icon md:hidden" aria-hidden="true">
            <Swords size={17} strokeWidth={1.8} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              {showStatus ? <StatusBadge status={tournament.status} /> : null}
              <span className="mono text-[8px] uppercase tracking-[0.08em] text-[#a1979b]">
                {MODALITY_LABELS[tournament.modality as Modality]}
              </span>
              {tournament.access === "PRIVATE" ? (
                <span className="mono text-[8px] uppercase tracking-[0.08em] text-warning">
                  Privado
                </span>
              ) : null}

              <span className="mono ml-auto inline-flex items-center gap-1 text-[12px] font-medium text-flame-soft md:hidden">
                <Trophy size={10} aria-hidden="true" />
                {prize}
              </span>
            </div>

            <h3 className="mt-2 text-[16px] font-semibold leading-snug text-white transition-colors group-hover:text-flame-soft md:mt-1.5 md:text-[17px]">
              {tournament.name}
            </h3>
            <p className="mt-1 line-clamp-1 text-[11px] text-[#8f8388] md:text-xs">
              {tournament.description}
            </p>
          </div>
        </div>

        <div className="tournament-meta-grid">
          <div>
            <p className="tournament-meta-label">Nivel</p>
            <p className="tournament-meta-value">
              {MODALITY_LABELS[tournament.modality as Modality]}
            </p>
          </div>
          <div>
            <p className="tournament-meta-label">Cupos</p>
            <p className="tournament-meta-value">
              {tournament.occupancy.available} libres
            </p>
          </div>
          <div>
            <p className="tournament-meta-label">Inscripción</p>
            <p className="tournament-meta-value">Por WhatsApp</p>
          </div>
        </div>

        <div className="tournament-mobile-cta">
          <div className="min-w-0 flex-1">
            <span className="mono text-[8px] uppercase tracking-[0.06em] text-[#91848a]">
              {tournament.occupancy.occupied}/{tournament.maxTeams} equipos
            </span>
            <div className="progress-track mt-1.5">
              <div className="progress-fill" style={{ width: `${occupiedPercent}%` }} />
            </div>
          </div>
          <span className="btn btn-primary btn-sm">
            {tournament.registrationOpen ? "Inscribirse" : "Ver torneo"}
            <ChevronRight size={12} aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="mono text-[8px] uppercase tracking-[0.1em] text-[#84777c]">
          Premio
        </div>
        <div className="mono mt-1 flex items-center gap-1.5 text-[13px] text-white">
          <Trophy size={11} className="text-gold" aria-hidden="true" />
          {prize}
        </div>
      </div>

      <div className="hidden md:block">
        <div className="flex items-center justify-between gap-2">
          <span className="mono text-[8px] uppercase tracking-[0.1em] text-[#84777c]">
            Cupos
          </span>
          <span className="mono text-[9px] text-[#d8cdd1]">
            {tournament.occupancy.available} libres
          </span>
        </div>
        <div className="progress-track mt-2">
          <div className="progress-fill" style={{ width: `${occupiedPercent}%` }} />
        </div>
      </div>

      <div className="hidden items-center justify-end md:flex">
        <span className="mono inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.08em] text-[#c9bec2] transition-colors group-hover:text-flame-soft">
          Ver torneo
          <ChevronRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
