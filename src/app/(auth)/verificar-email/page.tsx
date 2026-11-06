import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createHash } from "node:crypto";
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Verificar email · NEXUS FF" };
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // Si ya está autenticado y verificado, al panel
  const user = await getCurrentUser();
  if (user) {
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { emailVerifiedAt: true },
    });
    if (dbUser?.emailVerifiedAt) redirect("/panel");
  }

  if (!token) {
    return <VerifyResult status="invalid" />;
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.expiresAt <= new Date()) {
    // Limpiar token expirado
    if (record) {
      await db.emailVerificationToken.delete({ where: { id: record.id } });
    }
    return <VerifyResult status="expired" />;
  }

  // Verificar el email
  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    db.emailVerificationToken.delete({ where: { id: record.id } }),
  ]);

  return <VerifyResult status="success" name={record.user.name} />;
}

function VerifyResult({
  status,
  name,
}: {
  status: "success" | "expired" | "invalid";
  name?: string;
}) {
  if (status === "success") {
    return (
      <div className="w-full max-w-sm">
        <div className="auth-card text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-md border border-success/30 bg-success/[0.07] text-success">
            <CheckCircle2 size={22} aria-hidden="true" />
          </span>
          <p className="kicker mt-5 justify-center">Verificación de email</p>
          <h1 className="display mt-3 text-3xl md:text-4xl">Email verificado</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            {name ? `Hola ${name}, tu` : "Tu"} cuenta quedó activada. Ya podés acceder a tu panel.
          </p>
          <a href="/panel" className="btn btn-primary btn-block mt-6">
            Ir al panel
          </a>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="w-full max-w-sm">
        <div className="auth-card text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-md border border-warning/30 bg-warning/[0.07] text-warning">
            <Clock3 size={22} aria-hidden="true" />
          </span>
          <p className="kicker mt-5 justify-center">Verificación de email</p>
          <h1 className="display mt-3 text-3xl md:text-4xl">Enlace vencido</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            El enlace de verificación venció (válido por 24 hs). Iniciá sesión y te
            vamos a ofrecer reenviar el email.
          </p>
          <a href="/login" className="btn btn-secondary btn-block mt-6">
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="auth-card text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-md border border-danger/30 bg-danger/[0.07] text-danger">
          <AlertTriangle size={22} aria-hidden="true" />
        </span>
        <p className="kicker mt-5 justify-center">Verificación de email</p>
        <h1 className="display mt-3 text-3xl md:text-4xl">Enlace inválido</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          El enlace no es válido. Si creaste una cuenta, revisá el email que
          recibiste o pedí uno nuevo iniciando sesión.
        </p>
        <a href="/login" className="btn btn-secondary btn-block mt-6">
          Iniciar sesión
        </a>
      </div>
    </div>
  );
}
