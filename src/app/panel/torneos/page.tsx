import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { getCaptainTournaments, getTeamsForUser } from "@/lib/queries/captain";
import { TournamentRow } from "@/components/tournament-row";
import { ActionForm } from "@/components/forms/action-form";
import { redeemInviteCodeAction } from "@/actions/registrations";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Torneos disponibles" };
export const dynamic = "force-dynamic";

export default async function CaptainTournamentsPage() {
  const user = await requireUser("/panel/torneos");
  const [tournaments, teams] = await Promise.all([
    getCaptainTournaments(user.id),
    getTeamsForUser(user.id),
  ]);

  const owned = teams.owned;

  return (
    <>
      <PageHeader
        title="Torneos disponibles"
        description="Torneos públicos y privados a los que tenés acceso. La inscripción se coordina por WhatsApp."
        actions={
          <Link href="/torneos" className="btn btn-secondary btn-sm">
            Ver calendario público
          </Link>
        }
      />

      {tournaments.length === 0 ? (
        <EmptyState
          title="No hay torneos disponibles"
          description="Cuando se publiquen torneos públicos o te inviten a uno privado, van a aparecer acá."
          action={{ href: "/torneos", label: "Explorar torneos" }}
        />
      ) : (
        <div>
          <div className="mono hidden grid-cols-[76px_minmax(0,1fr)_150px_150px_100px] gap-x-6 border-b border-line px-3 pb-2 text-[10px] text-muted md:grid">
            <span>Fecha</span>
            <span>Torneo</span>
            <span>Premio</span>
            <span>Cupos</span>
            <span />
          </div>
          {tournaments.map((tournament) => (
            <div key={tournament.id}>
              <TournamentRow tournament={tournament} />
              <div className="flex flex-wrap items-center gap-3 border-b border-line px-3 pb-3 md:pl-[100px]">
                {tournament.invited ? (
                  <span className="mono text-[10px] text-warning">Invitación privada</span>
                ) : null}
                <Link
                  href={`/torneos/${tournament.slug}`}
                  className="btn btn-primary btn-sm"
                >
                  Ver torneo
                </Link>
                {tournament.registrationOpen ? (
                  <span className="mono text-[10px] text-success">Inscripción abierta</span>
                ) : (
                  <span className="mono text-[10px] text-muted">
                    {tournament.registrationReason ?? "Inscripción cerrada"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="panel p-6">
          <h2 className="display text-2xl">Acceso a torneo privado</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Si te compartieron un código, ingresalo para habilitar a uno de tus equipos.
            Después, coordiná la inscripción por el grupo de WhatsApp del torneo.
          </p>
          {owned.length > 0 ? (
            <div className="mt-5">
              <ActionForm
                action={redeemInviteCodeAction}
                submitLabel="Habilitar acceso"
                pendingLabel="Verificando…"
                className="space-y-4"
              >
                <div className="field">
                  <label htmlFor="invite-code" className="label">
                    Código de acceso
                  </label>
                  <input
                    id="invite-code"
                    name="code"
                    required
                    minLength={4}
                    maxLength={20}
                    className="input mono uppercase"
                    placeholder="EJEMPLO2026"
                  />
                </div>
                <div className="field">
                  <label htmlFor="invite-team" className="label">
                    Equipo
                  </label>
                  <select id="invite-team" name="teamId" className="select" required>
                    {owned.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.tag})
                      </option>
                    ))}
                  </select>
                  <span className="hint">La modalidad del equipo debe coincidir con la del torneo.</span>
                </div>
              </ActionForm>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Primero creá un equipo para poder canjear un código.
            </p>
          )}
        </div>

        <div className="panel p-6">
          <h2 className="display text-2xl">Inscripción por WhatsApp</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Entrá a la página del torneo y tocá «Inscribirse». El botón abre el grupo de
            WhatsApp exclusivo de ese torneo.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            La organización confirma tu cupo desde administración y te avisa por el mismo
            grupo.
          </p>
          <Link href="/panel/inscripciones" className="btn btn-secondary btn-sm mt-6">
            Ver mis inscripciones
          </Link>
        </div>
      </section>
    </>
  );
}
