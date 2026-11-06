"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { idleState, type ActionState } from "@/lib/action-state";
import { FormMessage } from "@/components/ui";
import { SubmitButton } from "@/components/forms/submit-button";

type ServerAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  className = "space-y-5",
  buttonClassName = "btn btn-primary",
  buttonFull = false,
  footer,
  successUrl,
  resetOnSuccess = false,
}: {
  action: ServerAction;
  children: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  className?: string;
  buttonClassName?: string;
  buttonFull?: boolean;
  footer?: ReactNode;
  successUrl?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, idleState);

  return (
    <form
      action={formAction}
      className={className}
      encType="multipart/form-data"
    >
      {children}
      {state.errors ? (
        <ul className="form-message form-message-error space-y-1">
          {Object.entries(state.errors).map(([field, message]) => (
            <li key={field}>{message}</li>
          ))}
        </ul>
      ) : null}
      <FormMessage status={state.status} message={state.message} />
      {state.status === "success" && state.url ? (
        <a href={state.url} className="btn btn-primary btn-sm">
          Continuar
        </a>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton
          className={`${buttonClassName}${buttonFull ? " btn-block" : ""}`}
          pendingLabel={pendingLabel}
        >
          {state.status === "success" && resetOnSuccess ? "Listo" : submitLabel}
        </SubmitButton>
        {footer}
      </div>
      {successUrl ? (
        <p className="hint">
          Si la operación fue exitosa, vas a ser redirigido automáticamente.
        </p>
      ) : null}
    </form>
  );
}
