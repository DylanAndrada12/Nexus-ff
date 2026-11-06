export const USER_ROLES = ["ADMIN", "CAPTAIN", "PLAYER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const MODALITIES = ["SOLO", "DUO", "SQUAD"] as const;
export type Modality = (typeof MODALITIES)[number];

export const MODALITY_LABELS: Record<Modality, string> = {
  SOLO: "Solo",
  DUO: "Dúo",
  SQUAD: "Escuadra",
};

export const MODALITY_SIZE: Record<Modality, number> = {
  SOLO: 1,
  DUO: 2,
  SQUAD: 4,
};

export const MAX_SUBSTITUTES = 2;

export const TOURNAMENT_ACCESS = ["PUBLIC", "PRIVATE"] as const;
export type TournamentAccess = (typeof TOURNAMENT_ACCESS)[number];

export const TOURNAMENT_STATUSES = [
  "UPCOMING",
  "REGISTRATION_OPEN",
  "FULL",
  "ONGOING",
  "FINISHED",
  "CANCELLED",
] as const;
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export const TOURNAMENT_STATUS_LABELS: Record<TournamentStatus, string> = {
  UPCOMING: "Próximamente",
  REGISTRATION_OPEN: "Inscripciones abiertas",
  FULL: "Cupos completos",
  ONGOING: "En curso",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
};

export const TOURNAMENT_FORMATS = [
  "POINTS",
  "SINGLE_ELIMINATION",
  "QUALIFIER",
  "LEAGUE",
  "MULTI_ROUND",
] as const;
export type TournamentFormat = (typeof TOURNAMENT_FORMATS)[number];

export const TOURNAMENT_FORMAT_LABELS: Record<TournamentFormat, string> = {
  POINTS: "Por puntos",
  SINGLE_ELIMINATION: "Eliminación directa",
  QUALIFIER: "Clasificatorio",
  LEAGUE: "Liga por fechas",
  MULTI_ROUND: "Varias rondas",
};

export const REGISTRATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
};

export const MEMBER_ROLES = ["TITULAR", "SUPLENTE"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export const ACTIVE_REGISTRATION_STATUSES = ["PENDING", "CONFIRMED"] as const;

export const DEFAULT_PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1];

export const TIEBREAKERS = [
  { value: "POINTS", label: "Puntos totales" },
  { value: "KILLS", label: "Eliminaciones" },
  { value: "BEST_PLACEMENT", label: "Mejor posición" },
] as const;
export type Tiebreaker = (typeof TIEBREAKERS)[number]["value"];

export const SITE = {
  name: "NEXUS FF",
  tagline: "Torneos de Free Fire",
  country: "Argentina",
  timezone: "America/Argentina/Buenos_Aires",
  locale: "es-AR",
  currency: "ARS",
} as const;
