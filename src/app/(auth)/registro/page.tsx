import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { RegisterForm } from "@/components/forms/auth-forms";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = { title: "Crear cuenta" };
export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/panel");

  const params = await searchParams;

  return (
    <AuthCard
      eyebrow="Crear cuenta"
      title="Entrá a la competencia."
      description="Creá tu cuenta. Después vas a poder armar tu equipo y coordinar la inscripción por WhatsApp."
      wide
    >
      <RegisterForm next={params.next} />
    </AuthCard>
  );
}
