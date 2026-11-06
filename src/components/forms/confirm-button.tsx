"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function ConfirmButton({
  children,
  message,
  className = "btn btn-danger btn-sm",
  pendingLabel = "Procesando…",
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {pending ? (
        <>
          <Loader2 size={13} className="animate-spin" /> {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
