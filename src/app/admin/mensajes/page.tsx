import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/dal";
import {
  getAdminAnnouncements,
  getAdminSupportMessages,
} from "@/lib/queries/admin";
import {
  createAnnouncementAction,
  deleteAnnouncementAction,
  resolveSupportMessageAction,
  toggleAnnouncementAction,
} from "@/actions/admin";
import { ActionForm } from "@/components/forms/action-form";
import { EmptyState, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Mensajes · Administración" };
export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireAdmin();
  const [messages, announcements] = await Promise.all([
    getAdminSupportMessages(),
    getAdminAnnouncements(),
  ]);
  const openMessages = messages.filter((message) => message.status === "OPEN");

  return (
    <>
      <PageHeader
        title="Mensajes y anuncios"
        description="Consultas de soporte enviadas desde el sitio y anuncios internos para todos los usuarios."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section>
          <div className="mb-3 flex items-end justify-between gap-3 border-b border-line pb-3">
            <h2 className="display text-2xl">Soporte</h2>
            <span className="mono text-[10px] text-muted">
              {openMessages.length} abiertos · {messages.length} totales
            </span>
          </div>

          {messages.length === 0 ? (
            <EmptyState
              title="Sin mensajes"
              description="Los mensajes enviados desde el formulario de contacto aparecen acá."
              compact
            />
          ) : (
            <ul className="space-y-3">
              {messages.map((message) => (
                <li key={message.id} className="panel">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{message.name}</span>
                        <span
                          className={`mono text-[9px] ${
                            message.status === "OPEN" ? "text-warning" : "text-success"
                          }`}
                        >
                          {message.status === "OPEN" ? "ABIERTO" : "RESUELTO"}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {message.email}
                      </p>
                      <p className="mono mt-1 text-[10px] text-muted">
                        {formatDateTime(message.createdAt)}
                      </p>
                    </div>
                    <ActionForm
                      action={resolveSupportMessageAction}
                      submitLabel={
                        message.status === "OPEN" ? "Marcar resuelto" : "Reabrir"
                      }
                      pendingLabel="Procesando…"
                      className="space-y-0"
                      buttonClassName="btn btn-secondary btn-sm"
                    >
                      <input type="hidden" name="id" value={message.id} />
                    </ActionForm>
                  </div>
                  <p className="whitespace-pre-line p-4 text-sm leading-relaxed text-white/80">
                    {message.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-3 border-b border-line pb-3">
            <h2 className="display text-2xl">Anuncios</h2>
            <p className="mt-1 text-xs text-muted">
              Un anuncio activo se notifica en el panel de todos los usuarios. Desactivarlo
              no borra la notificación ya enviada.
            </p>
          </div>

          <div className="panel p-5">
            <ActionForm
              action={createAnnouncementAction}
              submitLabel="Publicar anuncio"
              pendingLabel="Publicando…"
              className="space-y-4"
              resetOnSuccess
            >
              <div className="field">
                <label className="label">Título</label>
                <input
                  name="title"
                  required
                  minLength={3}
                  maxLength={100}
                  className="input"
                  placeholder="Ej.: Nueva fecha del torneo"
                />
              </div>
              <div className="field">
                <label className="label">Mensaje</label>
                <textarea
                  name="body"
                  required
                  minLength={10}
                  maxLength={500}
                  rows={4}
                  className="textarea"
                  placeholder="Texto del anuncio para los usuarios."
                />
                <span className="hint">Entre 10 y 500 caracteres.</span>
              </div>
            </ActionForm>
          </div>

          <div className="mt-4 space-y-2">
            {announcements.length === 0 ? (
              <p className="text-xs text-muted">Todavía no hay anuncios creados.</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="panel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{announcement.title}</p>
                      <p className="mono mt-0.5 text-[10px] text-muted">
                        {formatDateTime(announcement.createdAt)} ·{" "}
                        {announcement.active ? "Activo" : "Inactivo"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ActionForm
                        action={toggleAnnouncementAction}
                        submitLabel={announcement.active ? "Desactivar" : "Activar"}
                        pendingLabel="…"
                        className="space-y-0"
                        buttonClassName="btn btn-ghost btn-sm"
                      >
                        <input type="hidden" name="id" value={announcement.id} />
                      </ActionForm>
                      <ActionForm
                        action={deleteAnnouncementAction}
                        submitLabel="Eliminar"
                        pendingLabel="…"
                        className="space-y-0"
                        buttonClassName="btn btn-danger btn-sm"
                      >
                        <input type="hidden" name="id" value={announcement.id} />
                      </ActionForm>
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-muted">
                    {announcement.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}
