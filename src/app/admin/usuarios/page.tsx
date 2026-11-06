import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/dal";
import { getAdminUsers } from "@/lib/queries/admin";
import {
  toggleUserSuspensionAction,
  updateUserRoleAction,
} from "@/actions/admin";
import { ActionForm } from "@/components/forms/action-form";
import { EmptyState, PageHeader } from "@/components/ui";
import { AdminPagination, parsePage } from "@/components/admin/pagination";
import { USER_ROLES, type UserRole } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Usuarios · Administración" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const admin = await requireAdmin();
  const query = await searchParams;
  const page = parsePage(query.pagina);
  const { items: users, totalPages, total } = await getAdminUsers(page);

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Roles y estado de las cuentas. El rol se verifica en cada request contra la base de datos."
      />

      <p className="mono mb-4 text-[11px] text-muted">{total} usuarios registrados</p>

      {users.length === 0 ? (
        <EmptyState
          title="No hay usuarios"
          description="Las cuentas aparecen acá cuando se registran en el sitio."
          compact
        />
      ) : (
        <>
          <div className="space-y-3">
            {users.map((user) => (
              <article key={user.id} className="panel">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{user.name}</span>
                      {user.id === admin.id ? (
                        <span className="mono text-[9px] text-white">VOS</span>
                      ) : null}
                      {user.suspended ? (
                        <span className="badge badge-rejected">Suspendido</span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
                    <p className="mono mt-1 text-[10px] text-muted">
                      Alta {formatDate(user.createdAt)} · {user._count.teamsLed} equipos
                      como capitán · {user._count.memberships} plantillas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mono text-xs">{user.role}</p>
                    <p className="mono mt-1 text-[10px] text-muted">
                      {user.id.slice(0, 12)}…
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-end">
                  <ActionForm
                    action={updateUserRoleAction}
                    submitLabel="Guardar rol"
                    pendingLabel="Guardando…"
                    className="flex flex-wrap items-end gap-3"
                    buttonClassName="btn btn-secondary btn-sm"
                  >
                    <input type="hidden" name="userId" value={user.id} />
                    <div className="field min-w-[180px]">
                      <label className="hint">Rol</label>
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="select"
                      >
                        {USER_ROLES.map((role: UserRole) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </ActionForm>

                  {user.id !== admin.id ? (
                    <ActionForm
                      action={toggleUserSuspensionAction}
                      submitLabel={user.suspended ? "Reactivar cuenta" : "Suspender cuenta"}
                      pendingLabel="Procesando…"
                      className="space-y-0"
                      buttonClassName={
                        user.suspended
                          ? "btn btn-secondary btn-sm"
                          : "btn btn-danger btn-sm"
                      }
                    >
                      <input type="hidden" name="userId" value={user.id} />
                    </ActionForm>
                  ) : (
                    <p className="text-[11px] text-muted">
                      No podés suspender tu propia cuenta.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
          <AdminPagination page={page} totalPages={totalPages} buildHref={(p) => `/admin/usuarios?pagina=${p}`} />
        </>
      )}

      <div className="mt-6 border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold">Roles</h2>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted">
          ADMIN accede al panel administrativo completo. CAPTAIN puede crear equipos,
          inscribirlos y ver salas de sus inscripciones confirmadas. PLAYER solo accede a su
          cuenta y a sus equipos como integrante. Tiene que existir al menos un
          administrador.
        </p>
      </div>
    </>
  );
}

