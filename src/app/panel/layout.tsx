import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { PanelNav } from "@/components/panel/panel-nav";
import { StatusBadge } from "@/components/ui";
import { ActionForm } from "@/components/forms/action-form";
import { resendVerificationEmailAction } from "@/actions/auth";

export const dynamic = "force-dynamic";

const items = [
  { href: "/panel", label: "Resumen", exact: true },
  { href: "/panel/equipos", label: "Mis equipos" },
  { href: "/panel/torneos", label: "Torneos" },
  { href: "/panel/inscripciones", label: "Inscripciones" },
  { href: "/panel/salas", label: "Salas" },
  { href: "/panel/historial", label: "Historial" },
  { href: "/panel/notificaciones", label: "Notificaciones" },
  { href: "/panel/perfil", label: "Mi perfil" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/panel");

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { emailVerifiedAt: true },
  });
  const emailVerified = Boolean(dbUser?.emailVerifiedAt);

  return (
    <div className="site-main flex min-h-screen flex-col">
      <SiteHeader />

      {!emailVerified ? (
        <div className="border-b border-warning/30 bg-warning/5 px-4 py-3">
          <div className="container-nexus flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-warning">
              <span className="font-semibold">Verificá tu email</span> — Revisá tu bandeja de entrada ({user.email}). Sin verificar, algunas funciones pueden estar limitadas.
            </p>
            <ActionForm
              action={resendVerificationEmailAction}
              submitLabel="Reenviar email"
              pendingLabel="Enviando…"
              className="shrink-0"
              buttonClassName="btn btn-ghost btn-sm text-warning border-warning/40 hover:border-warning"
            ><></></ActionForm>
          </div>
        </div>
      ) : null}

      <div className="container-nexus flex-1 py-8 md:py-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
          <div>
            <p className="eyebrow">Panel del capitán</p>
            <h1 className="display mt-1 text-3xl md:text-4xl">{user.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={user.role === "ADMIN" ? "APPROVED" : "CONFIRMED"} />
            {user.role === "ADMIN" ? (
              <Link href="/admin" className="btn btn-secondary btn-sm">
                Ir a administración
              </Link>
            ) : null}
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <PanelNav items={items} />
            <div className="mt-6 hidden border border-line bg-surface p-4 lg:block">
              <p className="mono text-[10px] text-muted">Cuenta</p>
              <p className="mt-2 truncate text-xs text-white/70">{user.email}</p>
              <Link
                href="/torneos"
                className="mt-4 inline-flex text-xs text-white underline decoration-line underline-offset-4 hover:decoration-white"
              >
                Explorar torneos
              </Link>
            </div>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

