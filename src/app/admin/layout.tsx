import Link from "next/link";
import { requireAdmin } from "@/lib/auth/dal";
import { SiteHeader } from "@/components/site-header";
import { PanelNav } from "@/components/panel/panel-nav";

export const dynamic = "force-dynamic";

const items = [
  { href: "/admin", label: "Resumen", exact: true },
  { href: "/admin/torneos", label: "Torneos" },
  { href: "/admin/equipos", label: "Equipos" },
  { href: "/admin/inscripciones", label: "Inscripciones" },
  { href: "/admin/resultados", label: "Resultados" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/mensajes", label: "Mensajes" },
  { href: "/admin/auditoria", label: "Auditoría" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="site-main flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container-nexus flex-1 py-8 md:py-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
          <div>
            <p className="eyebrow">Administración</p>
            <h1 className="display mt-1 text-3xl md:text-4xl">NEXUS FF</h1>
            <p className="mt-1 text-xs text-muted">{admin.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-approved">Administrador</span>
            <Link href="/" className="btn btn-ghost btn-sm">
              Ver sitio
            </Link>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12">
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <PanelNav items={items} />
            <div className="mt-6 hidden border border-line bg-surface p-4 lg:block">
              <p className="mono text-[10px] text-muted">Recordatorio</p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                Toda acción administrativa queda registrada en la auditoría.
              </p>
              <Link
                href="/admin/auditoria"
                className="mt-3 inline-flex text-xs text-white underline decoration-line underline-offset-4"
              >
                Ver registros
              </Link>
            </div>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
