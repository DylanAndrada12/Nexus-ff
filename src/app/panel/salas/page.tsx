import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, LockKeyhole, Timer } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getCaptainRooms } from "@/lib/queries/captain";
import { formatDateTime } from "@/lib/format";
import { CopyButton } from "@/components/copy-button";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Salas" };
export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const user = await requireUser("/panel/salas");
  const registrations = await getCaptainRooms(user.id);

  return (
    <>
      <PageHeader
        title="Salas de Free Fire"
        description="Los datos de sala se muestran únicamente a capitanes con inscripción confirmada y cuando la administración los publica."
      />

      {registrations.length === 0 ? (
        <EmptyState
          title="No hay salas disponibles"
          description="Cuando la administración publique la sala de un torneo en el que tenés una inscripción confirmada, va a aparecer acá con su ID, contraseña e indicaciones."
          action={{ href: "/panel/inscripciones", label: "Ver inscripciones" }}
        />
      ) : (
        <div className="space-y-5">
          {registrations.map((registration) => {
            const room = registration.tournament.room;
            if (!room) return null;
            return (
              <article key={registration.id} className="panel">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5">
                  <div>
                    <h2 className="text-lg font-semibold">{registration.tournament.name}</h2>
                    <p className="mt-1 text-xs text-muted">
                      {registration.team.name} ({registration.team.tag}) ·{" "}
                      {formatDateTime(registration.tournament.startsAt)}
                    </p>
                  </div>
                  <span className="badge badge-confirmed">Publicada</span>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <div className="rounded-[9px] border border-line bg-surface p-5">
                    <div className="flex items-center gap-2 text-muted">
                      <KeyRound size={14} aria-hidden="true" />
                      <span className="mono text-[10px]">ID de sala</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="mono break-all text-xl">{room.code}</p>
                      <CopyButton value={room.code} label="Copiar ID" />
                    </div>
                  </div>
                  <div className="rounded-[9px] border border-line bg-surface p-5">
                    <div className="flex items-center gap-2 text-muted">
                      <LockKeyhole size={14} aria-hidden="true" />
                      <span className="mono text-[10px]">Contraseña</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="mono break-all text-xl">{room.password}</p>
                      <CopyButton value={room.password} label="Copiar clave" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-line p-5">
                  {room.opensAt ? (
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Timer size={14} aria-hidden="true" />
                      Apertura: {formatDateTime(room.opensAt)}
                    </div>
                  ) : null}
                  {room.instructions ? (
                    <div className="mt-4 border-l-2 border-line pl-3">
                      <p className="mono text-[10px] text-muted">Indicaciones</p>
                      <p className="prose-nexus mt-1 text-sm">{room.instructions}</p>
                    </div>
                  ) : null}
                  <p className="mt-4 text-[11px] leading-relaxed text-muted">
                    No compartas estos datos fuera de tu equipo. El acceso está vinculado a
                    tu inscripción confirmada en este torneo.
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-4 text-xs text-muted">
        <Link href="/panel/inscripciones" className="underline decoration-line underline-offset-4 hover:text-white">
          Estado de mis inscripciones
        </Link>
        <Link href="/panel/torneos" className="underline decoration-line underline-offset-4 hover:text-white">
          Buscar torneos
        </Link>
      </div>
    </>
  );
}
