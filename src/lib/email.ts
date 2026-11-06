import "server-only";

import { env } from "@/lib/env";

type EmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Envío de correo opcional mediante Resend.
 * Si no hay proveedor configurado, en desarrollo se loguea el contenido y en
 * producción se registra el error (la acción de recuperación no filtra si el
 * email existe o no).
 */
export async function sendEmail(input: EmailInput): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    if (env.isDevelopment) {
      console.info("[email:dev]", input.to, input.subject, input.text);
      return false;
    }
    console.error(
      "[email] Falta RESEND_API_KEY. No se pudo enviar el correo transaccional.",
    );
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[email] Resend respondió con error:", response.status, detail);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Error de red:", error);
    return false;
  }
}
