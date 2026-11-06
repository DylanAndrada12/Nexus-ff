"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { actionError, actionSuccess, type ActionState } from "@/lib/action-state";
import { firstFieldErrors, emailSchema, passwordSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ingresá tu nombre.")
    .max(60, "El nombre es demasiado largo."),
  email: emailSchema,
});

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return actionError("Tu sesión venció. Volvé a iniciar sesión.");

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError(
      "Revisá los datos del perfil.",
      firstFieldErrors(parsed.error),
    );
  }

  const emailTaken = await db.user.findFirst({
    where: { email: parsed.data.email, id: { not: user.id } },
  });
  if (emailTaken) {
    return actionError("Ese email ya está registrado por otra cuenta.", {
      email: "Elegí otro email.",
    });
  }

  await db.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, email: parsed.data.email },
  });

  revalidatePath("/panel/perfil");
  revalidatePath("/panel");
  return actionSuccess("Perfil actualizado.");
}

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresá tu contraseña actual."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Repetí la nueva contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return actionError("Tu sesión venció. Volvé a iniciar sesión.");

  const limit = checkRateLimit(`change-password:${user.id}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return actionError("Demasiados intentos. Esperá unos minutos.");
  }

  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError(
      "Revisá los datos ingresados.",
      firstFieldErrors(parsed.error),
    );
  }

  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!record) return actionError("La cuenta no existe.");

  const valid = await bcrypt.compare(parsed.data.currentPassword, record.passwordHash);
  if (!valid) {
    return actionError("La contraseña actual no es correcta.", {
      currentPassword: "Verificá la contraseña actual.",
    });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash } }),
    db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
  ]);

  return actionSuccess("Contraseña actualizada.");
}
