import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminSettingsPage } from "@/lib/queries/admin";
import { saveSettingsAction } from "@/actions/admin";
import { ActionForm } from "@/components/forms/action-form";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Configuración · Administración" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getAdminSettingsPage();

  return (
    <>
      <PageHeader
        title="Configuración del sitio"
        description="Datos de contacto y enlaces públicos. Las credenciales de base de datos y email se configuran solo por variables de entorno."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-6">
          <h2 className="display text-2xl">Contacto y redes</h2>
          <p className="mt-1 text-xs text-muted">
            Se muestran en el pie del sitio y en la página de contacto. Los campos vacíos no
            se publican.
          </p>
          <div className="mt-5">
            <ActionForm
              action={saveSettingsAction}
              submitLabel="Guardar configuración"
              pendingLabel="Guardando…"
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="field">
                  <label className="label">Email de contacto</label>
                  <input
                    name="contact_email"
                    type="email"
                    defaultValue={settings.contact_email ?? ""}
                    className="input"
                    placeholder="contacto@nexusff.com"
                  />
                </div>
                <div className="field">
                  <label className="label">WhatsApp</label>
                  <input
                    name="contact_whatsapp"
                    defaultValue={settings.contact_whatsapp ?? ""}
                    className="input mono"
                    placeholder="+54 9 11 0000 0000"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="field">
                  <label className="label">Instagram</label>
                  <input
                    name="instagram_url"
                    type="url"
                    defaultValue={settings.instagram_url ?? ""}
                    className="input"
                    placeholder="https://instagram.com/…"
                  />
                </div>
                <div className="field">
                  <label className="label">YouTube</label>
                  <input
                    name="youtube_url"
                    type="url"
                    defaultValue={settings.youtube_url ?? ""}
                    className="input"
                    placeholder="https://youtube.com/…"
                  />
                </div>
                <div className="field">
                  <label className="label">Twitch</label>
                  <input
                    name="twitch_url"
                    type="url"
                    defaultValue={settings.twitch_url ?? ""}
                    className="input"
                    placeholder="https://twitch.tv/…"
                  />
                </div>
                <div className="field">
                  <label className="label">Discord</label>
                  <input
                    name="discord_url"
                    type="url"
                    defaultValue={settings.discord_url ?? ""}
                    className="input"
                    placeholder="https://discord.gg/…"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Horario de atención</label>
                <input
                  name="support_hours"
                  maxLength={2000}
                  defaultValue={settings.support_hours ?? ""}
                  className="input"
                  placeholder="Lunes a viernes de 10 a 18 hs (ARG)"
                />
              </div>

              <div className="field">
                <label className="label">Nota de contacto</label>
                <textarea
                  name="contact_note"
                  rows={3}
                  maxLength={2000}
                  defaultValue={settings.contact_note ?? ""}
                  className="textarea"
                  placeholder="Tiempo de respuesta estimado, canales alternativos, etc."
                />
              </div>

              <div className="field">
                <label className="label">Texto de la organización</label>
                <textarea
                  name="organization_text"
                  rows={4}
                  maxLength={2000}
                  defaultValue={settings.organization_text ?? ""}
                  className="textarea"
                  placeholder="Descripción breve de NEXUS FF para la landing."
                />
              </div>
            </ActionForm>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="panel p-5">
            <h2 className="mono text-[10px] text-muted">No editable desde acá</h2>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
              <li>
                <span className="text-white">Base de datos:</span> DATABASE_URL en{" "}
                <span className="mono">.env</span>.
              </li>
              <li>
                <span className="text-white">Sesiones:</span> SESSION_SECRET en{" "}
                <span className="mono">.env</span>.
              </li>
              <li>
                <span className="text-white">Email:</span> RESEND_API_KEY y EMAIL_FROM en{" "}
                <span className="mono">.env</span>.
              </li>
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Nunca cargues credenciales en la base de datos ni en el panel. Si rotás una
              clave, actualizá la variable de entorno y reiniciá el proceso.
            </p>
          </section>

          <section className="panel p-5">
            <h2 className="mono text-[10px] text-muted">Inscripciones por WhatsApp</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              El enlace de cada grupo se configura al crear o editar un torneo. Si un torneo
              no tiene enlace, la inscripción se muestra como no disponible.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
