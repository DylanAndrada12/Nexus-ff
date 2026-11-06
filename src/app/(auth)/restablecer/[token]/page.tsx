import type { Metadata } from "next";
import Link from "next/link";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { isExpired } from "@/lib/time";
import { ResetPasswordForm } from "@/components/forms/auth-forms";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = { title: "Nueva contraseña" };
export const dynamic = "force-dynamic";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const record = token
    ? await db.passwordResetToken.findUnique({
        where: { tokenHash: sha256(token) },
        select: { expiresAt: true, usedAt: true },
      })
    : null;

  const valid =
    record && !record.usedAt && !isExpired(record.expiresAt);

  if (!valid) {
    return (
      <AuthCard
        eyebrow="Enlace vencido"
        title="Enlace vencido."
        description="Este enlace de recuperación ya no es válido. Pedí uno nuevo para elegir tu contraseña."
      >
        <Link href="/recuperar" className="btn btn-primary btn-block">
          Solicitar un enlace nuevo
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Nueva contraseña"
      title="Elegí tu nueva clave."
      description="El enlace es de un solo uso y vence en una hora. Después vas a poder iniciar sesión normalmente."
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
