import {
  MAX_SUBSTITUTES,
  MODALITY_LABELS,
  MODALITY_SIZE,
  type Modality,
} from "@/lib/constants";

type TeamLike = {
  id: string;
  name: string;
  modality: string;
  suspended: boolean;
  captainId: string;
  members: { uid: string; role: string; userId: string | null }[];
};

type TournamentLike = {
  id: string;
  modality: string;
  allowSubstitutes: boolean;
};

export type TeamEligibility = {
  eligible: boolean;
  reason?: string;
};

export function validateTeamForTournament(
  team: TeamLike,
  tournament: TournamentLike,
  options: {
    hasRegistration: boolean;
    otherUidsInTournament: Set<string>;
  },
): TeamEligibility {
  if (options.hasRegistration) {
    return { eligible: false, reason: "El equipo ya tiene una inscripción en este torneo." };
  }
  if (team.suspended) {
    return { eligible: false, reason: "El equipo está suspendido." };
  }
  if (team.modality !== tournament.modality) {
    return {
      eligible: false,
      reason: `El equipo es de modalidad ${MODALITY_LABELS[team.modality as Modality] ?? team.modality} y el torneo es ${MODALITY_LABELS[tournament.modality as Modality] ?? tournament.modality}.`,
    };
  }

  const titulares = team.members.filter((member) => member.role === "TITULAR");
  const suplentes = team.members.filter((member) => member.role === "SUPLENTE");
  const required = MODALITY_SIZE[tournament.modality as Modality] ?? 1;

  if (titulares.length !== required) {
    return {
      eligible: false,
      reason: `El torneo requiere exactamente ${required} titular${required === 1 ? "" : "es"} y el equipo tiene ${titulares.length}.`,
    };
  }
  if (!titulares.some((member) => member.userId === team.captainId)) {
    return {
      eligible: false,
      reason: "El capitán debe figurar como titular del equipo.",
    };
  }
  if (suplentes.length > MAX_SUBSTITUTES) {
    return {
      eligible: false,
      reason: `El equipo no puede tener más de ${MAX_SUBSTITUTES} suplentes.`,
    };
  }
  if (!tournament.allowSubstitutes && suplentes.length > 0) {
    return {
      eligible: false,
      reason: "Este torneo no admite suplentes; quitá los suplentes para inscribirte.",
    };
  }

  const conflict = team.members.find((member) =>
    options.otherUidsInTournament.has(member.uid),
  );
  if (conflict) {
    return {
      eligible: false,
      reason:
        "Uno de los UID del equipo ya está inscripto en este torneo con otro equipo.",
    };
  }

  return { eligible: true };
}
