"use client";

import Link from "next/link";
import { useActionState } from "react";
import { idleState } from "@/lib/action-state";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
} from "@/actions/auth";
import { FormMessage } from "@/components/ui";
import { SubmitButton } from "@/components/forms/submit-button";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="error-text">
      {message}
    </span>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, idleState);

  return (
    <form action={action} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="field">
        <label htmlFor="login-email" className="label">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="tu@email.com"
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby={state.errors?.email ? "login-email-error" : undefined}
        />
        <FieldError id="login-email-error" message={state.errors?.email} />
      </div>
      <div className="field">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="label">
            Contraseña
          </label>
          <Link
            href="/recuperar"
            className="text-xs text-muted underline decoration-line underline-offset-4 hover:text-white"
          >
            Olvidé mi contraseña
          </Link>
        </div>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input"
          aria-invalid={Boolean(state.errors?.password)}
          aria-describedby={state.errors?.password ? "login-password-error" : undefined}
        />
        <FieldError id="login-password-error" message={state.errors?.password} />
      </div>

      <FormMessage status={state.status} message={state.message} />

      <SubmitButton className="btn btn-primary btn-block" pendingLabel="Ingresando…">
        Iniciar sesión
      </SubmitButton>

      <p className="text-center text-xs text-muted">
        ¿Todavía no tenés cuenta?{" "}
        <Link href="/registro" className="text-white underline underline-offset-4">
          Registrate
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useActionState(registerAction, idleState);

  return (
    <form action={action} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="field">
        <label htmlFor="register-name" className="label">
          Nombre y apellido
        </label>
        <input
          id="register-name"
          name="name"
          required
          minLength={2}
          maxLength={60}
          autoComplete="name"
          className="input"
          placeholder="Cómo querés figurar"
          aria-invalid={Boolean(state.errors?.name)}
        />
        <FieldError id="register-name-error" message={state.errors?.name} />
      </div>
      <div className="field">
        <label htmlFor="register-email" className="label">
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="tu@email.com"
          aria-invalid={Boolean(state.errors?.email)}
        />
        <FieldError id="register-email-error" message={state.errors?.email} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="register-password" className="label">
            Contraseña
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
            aria-invalid={Boolean(state.errors?.password)}
            aria-describedby="register-password-hint"
          />
          <span id="register-password-hint" className="hint">
            Mínimo 8 caracteres, con una letra y un número.
          </span>
          <FieldError id="register-password-error" message={state.errors?.password} />
        </div>
        <div className="field">
          <label htmlFor="register-confirm" className="label">
            Repetir contraseña
          </label>
          <input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="input"
            aria-invalid={Boolean(state.errors?.confirmPassword)}
          />
          <FieldError
            id="register-confirm-error"
            message={state.errors?.confirmPassword}
          />
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-muted">
        Al crear tu cuenta aceptás las normas de competencia de NEXUS FF y el
        tratamiento de tus datos para la organización de los torneos.
      </p>

      <FormMessage status={state.status} message={state.message} />

      <SubmitButton className="btn btn-primary btn-block" pendingLabel="Creando cuenta…">
        Crear cuenta
      </SubmitButton>

      <p className="text-center text-xs text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-white underline underline-offset-4">
          Iniciá sesión
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, idleState);

  return (
    <form action={action} className="space-y-5">
      <div className="field">
        <label htmlFor="forgot-email" className="label">
          Email de tu cuenta
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="tu@email.com"
          aria-invalid={Boolean(state.errors?.email)}
        />
        <FieldError id="forgot-email-error" message={state.errors?.email} />
      </div>

      <FormMessage status={state.status} message={state.message} />

      {state.resetUrl ? (
        <div className="border border-line bg-surface p-4">
          <p className="mono text-[10px] text-warning">Entorno de desarrollo</p>
          <p className="mt-2 text-xs text-muted">
            No hay proveedor de email configurado. Usá este enlace para continuar:
          </p>
          <a
            href={state.resetUrl}
            className="mt-3 inline-block break-all text-xs text-white underline underline-offset-4"
          >
            {state.resetUrl}
          </a>
        </div>
      ) : null}

      <SubmitButton className="btn btn-primary btn-block" pendingLabel="Enviando…">
        Enviar enlace
      </SubmitButton>

      <p className="text-center text-xs text-muted">
        <Link href="/login" className="text-white underline underline-offset-4">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, idleState);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <div className="field">
        <label htmlFor="reset-password" className="label">
          Nueva contraseña
        </label>
        <input
          id="reset-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="input"
          aria-invalid={Boolean(state.errors?.password)}
        />
        <span className="hint">Mínimo 8 caracteres, con una letra y un número.</span>
        <FieldError id="reset-password-error" message={state.errors?.password} />
      </div>
      <div className="field">
        <label htmlFor="reset-confirm" className="label">
          Repetir contraseña
        </label>
        <input
          id="reset-confirm"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="input"
          aria-invalid={Boolean(state.errors?.confirmPassword)}
        />
        <FieldError id="reset-confirm-error" message={state.errors?.confirmPassword} />
      </div>

      <FormMessage status={state.status} message={state.message} />

      {state.url ? (
        <Link href={state.url} className="btn btn-primary btn-block">
          Ir a iniciar sesión
        </Link>
      ) : (
        <SubmitButton className="btn btn-primary btn-block" pendingLabel="Guardando…">
          Cambiar contraseña
        </SubmitButton>
      )}
    </form>
  );
}
