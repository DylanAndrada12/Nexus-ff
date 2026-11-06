"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppRegistrationButton({
  tournamentName,
  whatsappUrl,
  className = "btn btn-primary",
  label = "Inscribirse",
}: {
  tournamentName: string;
  whatsappUrl: string;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
        <MessageCircle size={15} aria-hidden="true" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-registration-title"
            className="panel panel-accent relative w-full max-w-md overflow-hidden rounded-t-[16px] p-6 sm:rounded-[12px] sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-md border border-line text-muted transition-colors hover:border-flame/40 hover:text-white"
              aria-label="Cerrar"
            >
              <X size={15} aria-hidden="true" />
            </button>

            <span className="grid h-12 w-12 place-items-center rounded-full border border-[#25d366]/35 bg-[#25d366]/10 text-[#4ade80]">
              <MessageCircle size={22} aria-hidden="true" />
            </span>
            <h2 id="whatsapp-registration-title" className="display mt-5 text-4xl leading-[0.95]">
              ¡Inscribite por WhatsApp!
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Entrá al grupo de <span className="text-white">{tournamentName}</span> y la
              organización te confirma el cupo.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-primary btn-block mt-6"
            >
              Unirme al grupo
              <MessageCircle size={16} aria-hidden="true" />
            </a>

            <p className="mono mt-4 text-center text-[9px] uppercase tracking-[0.1em] text-[#8f8388]">
              El enlace es exclusivo de este torneo
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
