import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getTeamsForUser } from "@/lib/queries/captain";
import { MODALITY_LABELS, type Modality } from "@/lib/constants";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Mis equipos" };
export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const user = await requireUser("/panel/equipos");
  const { owned, memberships } = await getTeamsForUser(user.id);

  return (
    <>
      <PageHeader
        title="Mis equipos"
        description="Cada equipo tiene una modalidad fija y una plantilla que debe coincidir con la del torneo."
        actions={
          <Link href="/panel/equipos/nuevo" className="btn btn-primary btn-sm">
            <Plus size={14} aria-hidden="true" /> Nuevo equipo
          </Link>
        }
      />

      <section>
        <h2 className="mono mb-3 text-[10px] text-muted">Equipos que administro</h2>
        {owned.length === 0 ? (
          <EmptyState
            title="Todavía no creaste un equipo"
            description="Creá tu equipo, cargá los UID de la plantilla y después elegí el torneo en el que querés competir."
            action={{ href: "/panel/equipos/nuevo", label: "Crear equipo" }}
            compact
          />
        ) : (
          <div className={`grid gap-3 ${owned.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {owned.map((team) => (
              <Link
                key={team.id}
                href={`/panel/equipos/${team.id}`}
                className="panel group p-5 transition-colors hover:border-flame/35"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {team.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={team.logoUrl}
                        alt=""
                        className="h-12 w-12 flex-none rounded-md border border-line object-cover"
                      />
                    ) : (
                      <span className="grid h-12 w-12 flex-none place-items-center rounded-md border border-flame/25 bg-flame/[0.06] font-display text-sm text-flame-soft">
                        {team.tag.slice(0, 2)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-white transition-colors group-hover:text-flame-soft">
                        {team.name}
                      </h3>
                      <p className="mono mt-0.5 text-[10px] text-muted">
                        {team.tag} · {MODALITY_LABELS[team.modality as Modality]}
                      </p>
                    </div>
                  </div>
                  {team.suspended ? (
                    <span className="badge badge-rejected">Suspendido</span>
                  ) : (
                    <ArrowUpRight
                      size={14}
                      className="shrink-0 text-[#665a5f] transition-colors group-hover:text-flame-soft"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="mt-4 flex items-center gap-4 border-t border-line-soft pt-3 text-xs text-muted">
                  <span>{team._count.members} jugadores</span>
                  <span>{team._count.registrations} inscripciones</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {memberships.length > 0 ? (
        <section className="mt-10">
          <h2 className="mono mb-3 text-[10px] text-muted">Equipos en los que juego</h2>
          <ul className="divide-y divide-line border border-line bg-surface">
            {memberships.map((team) => (
              <li key={team.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium">{team.name}</p>
                  <p className="mono mt-0.5 text-[10px] text-muted">
                    {team.tag} · Capitán: {team.captain?.name ?? "—"}
                  </p>
                </div>
                <Link
                  href={`/panel/equipos/${team.id}`}
                  className="btn btn-secondary btn-sm"
                >
                  Ver plantilla
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold">Reglas de plantilla</h2>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
          <li>Solo: 1 titular. Dúo: 2 titulares. Escuadra: 4 titulares.</li>
          <li>Se permiten hasta 2 suplentes, solo si el torneo los habilita.</li>
          <li>El capitán debe figurar como titular del equipo.</li>
          <li>Un UID no puede repetirse en la plataforma ni dentro del mismo torneo.</li>
          <li>No se puede editar la plantilla con una inscripción activa.</li>
        </ul>
      </div>
    </>
  );
}
