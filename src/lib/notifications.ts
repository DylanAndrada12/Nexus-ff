import "server-only";

import { db } from "@/lib/db";

export type NotificationType =
  | "REGISTRATION_CONFIRMED"
  | "REGISTRATION_CANCELLED"
  | "RESULTS_PUBLISHED"
  | "ROOM_PUBLISHED"
  | "ANNOUNCEMENT"
  | "GENERAL";

type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
};

/**
 * Notificación in-app. La arquitectura deja el envío por email desacoplado:
 * cuando se configure un proveedor, se puede encolar aquí sin cambiar los
 * llamadores. Ver README > Notificaciones por email.
 */
export async function notifyUser(input: NotifyInput): Promise<void> {
  try {
    await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link ?? null,
      },
    });
  } catch (error) {
    console.error("No se pudo crear la notificación:", error);
  }
}

export async function notifyUsers(
  userIds: string[],
  data: Omit<NotifyInput, "userId">,
): Promise<void> {
  const unique = [...new Set(userIds)].filter(Boolean);
  if (unique.length === 0) return;

  try {
    await db.notification.createMany({
      data: unique.map((userId) => ({
        userId,
        type: data.type,
        title: data.title,
        body: data.body,
        link: data.link ?? null,
      })),
    });
  } catch (error) {
    console.error("No se pudieron crear las notificaciones:", error);
  }
}

export async function notifyTournamentCaptains(
  tournamentId: string,
  data: Omit<NotifyInput, "userId">,
): Promise<void> {
  const registrations = await db.registration.findMany({
    where: { tournamentId, status: "CONFIRMED" },
    select: { captainId: true },
    distinct: ["captainId"],
  });
  await notifyUsers(
    registrations.map((registration) => registration.captainId),
    data,
  );
}

export async function notifyAdmins(
  data: Omit<NotifyInput, "userId">,
): Promise<void> {
  const admins = await db.user.findMany({
    where: { role: "ADMIN", suspended: false },
    select: { id: true },
  });
  await notifyUsers(
    admins.map((admin) => admin.id),
    data,
  );
}
