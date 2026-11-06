"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { actionError, actionSuccess, type ActionState } from "@/lib/action-state";
import { checkRateLimit } from "@/lib/rate-limit";

const codeSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(4, "Ingresá el código de acceso.")
    .max(20, "El código no es válido."),
  teamId: z.string().min(1, "Elegí un equipo."),
});

export async function redeemInviteCodeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return actionError("Tenés que iniciar sesión.");

  const parsed = codeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Revisá el código.");
  }

  const limit = checkRateLimit(`invite-code:${user.id}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    return actionError("Demasiados intentos. Esperá unos minutos.");
  }

  const team = await db.team.findFirst({
    where: { id: parsed.data.teamId, captainId: user.id },
    select: { id: true, name: true, modality: true },
  });
  if (!team) return actionError("El equipo no existe o no te pertenece.");

  const tournament = await db.tournament.findFirst({
    where: {
      access: "PRIVATE",
      inviteCode: parsed.data.code,
      startsAt: { gte: new Date() },
      status: { in: ["UPCOMING", "REGISTRATION_OPEN", "FULL"] },
    },
    select: { id: true, name: true, slug: true, modality: true },
  });

  if (!tournament) {
    return actionError(
      "El código no corresponde a un torneo privado activo. Verificá que esté bien escrito.",
    );
  }
  if (tournament.modality !== team.modality) {
    return actionError(
      "La modalidad de tu equipo no coincide con la del torneo. Elegí otro equipo.",
    );
  }

  await db.tournamentInvite.upsert({
    where: {
      tournamentId_teamId: { tournamentId: tournament.id, teamId: team.id },
    },
    update: {},
    create: { tournamentId: tournament.id, teamId: team.id },
  });

  revalidatePath("/panel/torneos");
  return actionSuccess(
    `Acceso habilitado para ${team.name} en ${tournament.name}.`,
    `/torneos/${tournament.slug}`,
  );
}
