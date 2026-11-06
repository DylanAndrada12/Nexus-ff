import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/auth-forms";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Recuperar acceso"
      title="Recuperá tu cuenta."
      description="Ingresá el email con el que te registraste. Te vamos a enviar un enlace para elegir una nueva contraseña."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
