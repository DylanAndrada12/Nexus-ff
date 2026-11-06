"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { actionError, actionSuccess, type ActionState } from "@/lib/action-state";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { notifyAdmins } from "@/lib/notifications";
import { emailSchema, firstFieldErrors } from "@/lib/validation";

const supportSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre.").max(80),
  email: emailSchema,
  message: z
    .string()
    .trim()
    .min(10, "Contanos un poco más (mínimo 10 caracteres).")
    .max(2000, "El mensaje es demasiado largo."),
  website: z.string().optional(),
});

export async function submitSupportMessageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`support:${ip}`, 4, 15 * 60 * 1000);
  if (!limit.allowed) {
    return actionError("Enviaste varios mensajes seguidos. Esperá unos minutos.");
  }

  const parsed = supportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError("Revisá los datos del mensaje.", firstFieldErrors(parsed.error));
  }

  // Honeypot: si un bot completa el campo oculto, no guardamos nada.
  if (parsed.data.website) {
    return actionSuccess("Mensaje recibido. Te vamos a responder por email.");
  }

  const message = await db.supportMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    },
  });

  await notifyAdmins({
    type: "GENERAL",
    title: "Nuevo mensaje de soporte",
    body: `${message.name} (${message.email}) envió una consulta desde la web.`,
    link: "/admin/mensajes",
  });

  revalidatePath("/admin/mensajes");
  return actionSuccess(
    "Mensaje recibido. Te vamos a responder al email que indicaste.",
  );
}
