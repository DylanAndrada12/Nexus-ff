import type { Metadata } from "next";
import Link from "next/link";
import { BellRing } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getCaptainNotifications } from "@/lib/queries/captain";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notifications";
import { formatDateTime, humanDateTime } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Notificaciones" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser("/panel/notificaciones");
  const notifications = await getCaptainNotifications(user.id);
  const unread = notifications.filter((notification) => !notification.readAt).length;

  return (
    <>
      <PageHeader
        title="Notificaciones"
        description="Avisos de inscripciones, salas, resultados y anuncios de la organización."
        actions={
          unread > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <button type="submit" className="btn btn-secondary btn-sm">
                Marcar todas como leídas
              </button>
            </form>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="Sin notificaciones"
          description="Cuando se confirme una inscripción, se publique una sala o se carguen resultados, vas a recibir un aviso acá."
          compact
        />
      ) : (
        <ul className="divide-y divide-line border border-line bg-surface">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-4 md:p-5 ${notification.readAt ? "" : "bg-white/[0.025]"}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    notification.readAt ? "bg-line" : "bg-white"
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold">
                      {notification.title}
                    </h2>
                    {!notification.readAt ? (
                      <span className="mono text-[9px] text-white">NUEVA</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {notification.body}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-muted">
                    <span title={formatDateTime(notification.createdAt)}>
                      {humanDateTime(notification.createdAt)}
                    </span>
                    {notification.link ? (
                      <Link
                        href={notification.link}
                        className="text-white underline decoration-line underline-offset-4 hover:decoration-white"
                      >
                        Ver detalle
                      </Link>
                    ) : null}
                    {!notification.readAt ? (
                      <form action={markNotificationReadAction}>
                        <input type="hidden" name="id" value={notification.id} />
                        <button type="submit" className="hover:text-white">
                          Marcar como leída
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
                <BellRing size={15} className="mt-1 shrink-0 text-muted" aria-hidden="true" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
