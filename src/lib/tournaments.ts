import "server-only";

import type { Registration, Tournament } from "@prisma/client";
import {
  DEFAULT_PLACEMENT_POINTS,
  type Tiebreaker,
  type TournamentStatus,
} from "@/lib/constants";

export type Occupancy = {
  occupied: number;
  confirmed: number;
  pending: number;
  available: number;
  isFull: boolean;
};

export type PointsConfig = {
  killPoints: number;
  placements: number[];
  tiebreaker: Tiebreaker;
  matches: number;
};

export type PrizeEntry = {
  position: number;
  amount: number;
};

type RegistrationLike = Pick<Registration, "status">;

export function isHoldingSlot(registration: RegistrationLike): boolean {
  return registration.status === "PENDING" || registration.status === "CONFIRMED";
}

export function occupancyFrom(
  registrations: RegistrationLike[],
  maxTeams: number,
): Occupancy {
  const active = registrations.filter(isHoldingSlot);
  const confirmed = active.filter((r) => r.status === "CONFIRMED").length;
  const pending = active.length - confirmed;
  const occupied = active.length;
  return {
    occupied,
    confirmed,
    pending,
    available: Math.max(0, maxTeams - occupied),
    isFull: occupied >= maxTeams,
  };
}

export function effectiveStatus(
  tournament: Pick<Tournament, "status" | "maxTeams">,
  occupancy: Occupancy,
): TournamentStatus {
  if (tournament.status === "REGISTRATION_OPEN" && occupancy.isFull) {
    return "FULL";
  }
  return tournament.status as TournamentStatus;
}

export function registrationWindowOpen(
  tournament: Pick<
    Tournament,
    "status" | "startsAt" | "registrationClosesAt" | "access"
  >,
  occupancy: Occupancy,
  now = new Date(),
): { open: boolean; reason?: string } {
  if (tournament.status === "CANCELLED") {
    return { open: false, reason: "El torneo fue cancelado." };
  }
  if (tournament.status === "FINISHED" || tournament.status === "ONGOING") {
    return { open: false, reason: "El torneo ya no acepta inscripciones." };
  }
  if (tournament.status === "FULL") {
    return { open: false, reason: "No quedan cupos disponibles." };
  }
  if (tournament.status !== "REGISTRATION_OPEN") {
    return { open: false, reason: "Las inscripciones todavía no están abiertas." };
  }
  if (tournament.startsAt.getTime() <= now.getTime()) {
    return { open: false, reason: "El torneo ya comenzó." };
  }
  if (
    tournament.registrationClosesAt &&
    tournament.registrationClosesAt.getTime() <= now.getTime()
  ) {
    return { open: false, reason: "El plazo de inscripción cerró." };
  }
  if (occupancy.isFull) {
    return { open: false, reason: "No quedan cupos disponibles." };
  }
  return { open: true };
}

export function parsePointsConfig(raw: string | null | undefined): PointsConfig {
  try {
    const parsed = JSON.parse(raw || "{}") as Partial<PointsConfig>;
    const placements = Array.isArray(parsed.placements)
      ? parsed.placements
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value >= 0)
          .slice(0, 20)
      : DEFAULT_PLACEMENT_POINTS;

    const tiebreaker: Tiebreaker =
      parsed.tiebreaker === "KILLS" || parsed.tiebreaker === "BEST_PLACEMENT"
        ? parsed.tiebreaker
        : "POINTS";

    return {
      killPoints:
        Number.isFinite(Number(parsed.killPoints)) && Number(parsed.killPoints) >= 0
          ? Number(parsed.killPoints)
          : 1,
      placements: placements.length > 0 ? placements : DEFAULT_PLACEMENT_POINTS,
      tiebreaker,
      matches: Math.max(1, Number(parsed.matches) || 1),
    };
  } catch {
    return {
      killPoints: 1,
      placements: DEFAULT_PLACEMENT_POINTS,
      tiebreaker: "POINTS",
      matches: 1,
    };
  }
}

export function placementPoints(position: number, config: PointsConfig): number {
  if (position < 1) return 0;
  return config.placements[position - 1] ?? 0;
}

export function computeResultPoints(
  position: number,
  kills: number,
  config: PointsConfig,
): number {
  return placementPoints(position, config) + Math.max(0, kills) * config.killPoints;
}

export function parsePrizeDistribution(raw: string | null | undefined): PrizeEntry[] {
  try {
    const parsed = JSON.parse(raw || "[]") as PrizeEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => ({
        position: Number(entry.position),
        amount: Number(entry.amount),
      }))
      .filter(
        (entry) =>
          Number.isFinite(entry.position) &&
          entry.position > 0 &&
          Number.isFinite(entry.amount) &&
          entry.amount >= 0,
      )
      .sort((a, b) => a.position - b.position);
  } catch {
    return [];
  }
}

export function sumPrizes(distribution: PrizeEntry[]): number {
  return distribution.reduce((total, entry) => total + entry.amount, 0);
}
