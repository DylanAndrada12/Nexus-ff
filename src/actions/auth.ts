"use server";

import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  safeNextPath,
} from "@/lib/auth/session";
import { env, showDevResetLink } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import {
  actionError,
  actionSuccess,
  type ActionState,
} from "@/lib/action-state";
import {
  checkRateLimit,
  getClientIp,
  resetRateLimit,
} from "@/lib/rate-limit";
import {
  firstFieldErrors,
  forgotSchema,
  loginSchema,
  registerSchema,
  resetSchema,
} from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth/dal";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function sendVerificationEmail(userId: string, email: string, name: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hs

  await db.$transaction([
    db.emailVerificationToken.deleteMany({ where: { userId } }),
    db.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    }),
  ]);

  const verifyUrl = `${env.APP_URL}/verificar-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verificá tu cuenta de NEXUS FF",
    text: `Hola ${name}, verificá tu cuenta entrando en este enlace (válido 24 hs): ${verifyUrl}\n\nSi no creaste esta cuenta, ignorá este mensaje.`,
    html: `<div style="background:#000;color:#fff;padding:32px;font-family:Arial,sans-serif;max-width:480px">
      <h1 style="font-size:22px;margin:0 0 20px">NEXUS FF</h1>
      <p style="margin:0 0 8px">Hola <strong>${name}</strong>, para activar tu cuenta hacé clic en el botón:</p>
      <a href="${verifyUrl}" style="display:inline-block;background:#fff;color:#000;padding:12px 24px;text-decoration:none;font-weight:bold;margin:16px 0">Verificar email</a>
      <p style="color:#888;font-size:12px;margin:16px 0 0">El enlace vence en 24 horas. Si no creaste esta cuenta, ignorá este mensaje.</p>
    </div>`,
  });

  // En desarrollo, mostrar el link en consola si no hay Resend configurado
  if (env.isDevelopment && !env.RESEND_API_KEY) {
    console.info("[email:dev] Verificación:", verifyUrl);
  }
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`register:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.allowed) {
    return actionError("Demasiados intentos. Esperá unos minutos y volvé a probar.");
  }

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError(
      "Revisá los datos del formulario.",
      firstFieldErrors(parsed.error),
    );
  }

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return actionError("Ya existe una cuenta con ese email.", {
      email: "Ese email ya está registrado. Probá iniciar sesión.",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { name, email, passwordHash, role: "PLAYER" },
  });

  // Enviar email de verificación (no bloqueante — si falla, el usuario igual puede pedir reenvío)
  sendVerificationEmail(user.id, user.email, user.name).catch((err) => {
    console.error("[auth] Error enviando email de verificación:", err);
  });

  await createSession(user.id);
  const next = safeNextPath(parsed.data.next);
  redirect(next || "/panel?verificacion=pendiente");
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ip = await getClientIp();
  const rawEmail = String(formData.get("email") ?? "").toLowerCase();
  const limit = checkRateLimit(`login:${ip}:${rawEmail}`, 8, 10 * 60 * 1000);
  if (!limit.allowed) {
    return actionError(
      `Demasiados intentos fallidos. Probá de nuevo en ${Math.ceil(limit.retryAfterSeconds / 60)} minutos.`,
    );
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError(
      "Revisá los datos ingresados.",
      firstFieldErrors(parsed.error),
    );
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user
    ? await bcrypt.compare(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !valid) {
    return actionError("Email o contraseña incorrectos.");
  }

  if (user.suspended) {
    return actionError(
      "Tu cuenta está suspendida. Escribinos desde la sección de contacto para revisarlo.",
    );
  }

  resetRateLimit(`login:${ip}:${rawEmail}`);
  await createSession(user.id);
  const next = safeNextPath(parsed.data.next);
  redirect(next || (user.role === "ADMIN" ? "/admin" : "/panel"));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function resendVerificationEmailAction(
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return actionError("Tu sesión venció. Iniciá sesión nuevamente.");

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { emailVerifiedAt: true },
  });
  if (dbUser?.emailVerifiedAt) {
    return actionError("Tu email ya está verificado.");
  }

  const ip = await getClientIp();
  const limit = checkRateLimit(`resend-verify:${user.id}:${ip}`, 3, 10 * 60 * 1000);
  if (!limit.allowed) {
    return actionError("Demasiados intentos. Esperá unos minutos.");
  }

  await sendVerificationEmail(user.id, user.email, user.name);
  return actionSuccess("Te enviamos un nuevo email de verificación. Revisá también el spam.");
}

export async function forgotPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return actionError("Demasiadas solicitudes. Esperá unos minutos.");
  }

  const parsed = forgotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError(
      "Revisá el email ingresado.",
      firstFieldErrors(parsed.error),
    );
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  let resetUrl: string | undefined;

  if (user && !user.suspended) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.$transaction([
      db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      db.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      }),
    ]);

    resetUrl = `${env.APP_URL}/restablecer/${token}`;
    await sendEmail({
      to: user.email,
      subject: "Recuperá tu contraseña de NEXUS FF",
      text: `Para elegir una nueva contraseña, entrá en este enlace (vence en 1 hora): ${resetUrl}\n\nSi no pediste este cambio, ignorá el mensaje.`,
      html: `<div style="background:#000;color:#fff;padding:32px;font-family:Arial,sans-serif">
        <h1 style="font-size:24px;margin:0 0 16px">NEXUS FF</h1>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><a href="${resetUrl}" style="display:inline-block;background:#fff;color:#000;padding:12px 20px;text-decoration:none;font-weight:bold">Elegir nueva contraseña</a></p>
        <p style="color:#888;font-size:12px">El enlace vence en 1 hora. Si no pediste este cambio, ignorá el mensaje.</p>
      </div>`,
    });
  }

  return {
    status: "success",
    message:
      "Si existe una cuenta con ese email, te enviamos un enlace para restablecer la contraseña. Revisá también el spam.",
    resetUrl: showDevResetLink() ? resetUrl : undefined,
  };
}

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return actionError(
      "Revisá los datos ingresados.",
      firstFieldErrors(parsed.error),
    );
  }

  const tokenHash = sha256(parsed.data.token);
  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (
    !record ||
    record.usedAt ||
    record.expiresAt.getTime() <= Date.now() ||
    record.user.suspended
  ) {
    return actionError(
      "El enlace es inválido o ya venció. Solicitá uno nuevo desde la pantalla de recuperación.",
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    db.passwordResetToken.deleteMany({
      where: { userId: record.userId, id: { not: record.id } },
    }),
  ]);

  revalidatePath("/login");
  return actionSuccess(
    "Contraseña actualizada. Ya podés iniciar sesión.",
    "/login?reset=1",
  );
}
