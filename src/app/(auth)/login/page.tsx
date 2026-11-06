import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { LoginForm } from "@/components/forms/auth-forms";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = { title: "Iniciar sesión" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/panel");

  const params = await searchParams;

  return (
    <AuthCard
      eyebrow="Iniciar sesión"
      title="Volver a competir."
      description="Entrá con tu cuenta para gestionar equipos, inscripciones y salas."
    >
      {params.reset === "1" ? (
        <p className="form-message form-message-success mb-5">
          Contraseña actualizada. Ya podés iniciar sesión con la nueva clave.
        </p>
      ) : null}
      <LoginForm next={params.next} />
    </AuthCard>
  );
}
