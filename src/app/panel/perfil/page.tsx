import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { updateProfileAction, changePasswordAction } from "@/actions/profile";
import { ActionForm } from "@/components/forms/action-form";
import { KeyValue, PageHeader, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Mi perfil" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser("/panel/perfil");

  return (
    <>
      <PageHeader
        title="Mi perfil"
        description="Datos de tu cuenta. El rol se gestiona desde la administración cuando corresponde."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="panel p-6">
          <h2 className="display text-2xl">Datos personales</h2>
          <p className="mt-1 text-xs text-muted">
            El email se usa para iniciar sesión y recibir notificaciones.
          </p>
          <div className="mt-5">
            <ActionForm
              action={updateProfileAction}
              submitLabel="Guardar cambios"
              pendingLabel="Guardando…"
              className="space-y-4"
            >
              <div className="field">
                <label htmlFor="profile-name" className="label">
                  Nombre
                </label>
                <input
                  id="profile-name"
                  name="name"
                  defaultValue={user.name}
                  required
                  minLength={2}
                  maxLength={60}
                  className="input"
                  autoComplete="name"
                />
              </div>
              <div className="field">
                <label htmlFor="profile-email" className="label">
                  Email
                </label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  required
                  className="input"
                  autoComplete="email"
                />
              </div>
            </ActionForm>
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="display text-2xl">Cambiar contraseña</h2>
          <p className="mt-1 text-xs text-muted">
            Al cambiarla se invalidan los enlaces de recuperación pendientes.
          </p>
          <div className="mt-5">
            <ActionForm
              action={changePasswordAction}
              submitLabel="Cambiar contraseña"
              pendingLabel="Guardando…"
              className="space-y-4"
            >
              <div className="field">
                <label htmlFor="current-password" className="label">
                  Contraseña actual
                </label>
                <input
                  id="current-password"
                  name="currentPassword"
                  type="password"
                  required
                  className="input"
                  autoComplete="current-password"
                />
              </div>
              <div className="field">
                <label htmlFor="new-password" className="label">
                  Nueva contraseña
                </label>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="input"
                  autoComplete="new-password"
                />
                <span className="hint">Mínimo 8 caracteres, con una letra y un número.</span>
              </div>
              <div className="field">
                <label htmlFor="confirm-password" className="label">
                  Repetir nueva contraseña
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  className="input"
                  autoComplete="new-password"
                />
              </div>
            </ActionForm>
          </div>
        </section>
      </div>

      <section className="panel mt-6 p-6">
        <h2 className="mono text-[10px] text-muted">Cuenta</h2>
        <div className="mt-2 max-w-xl">
          <KeyValue
            label="Rol"
            value={
              <StatusBadge
                status={user.role === "ADMIN" ? "APPROVED" : "CONFIRMED"}
              />
            }
          />
          <KeyValue label="Alta" value={formatDate(user.createdAt)} />
          <KeyValue label="ID de cuenta" value={user.id} mono />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Si detectás un problema de seguridad en tu cuenta, escribinos desde la sección
          de contacto del sitio y suspendé temporalmente tu participación.
        </p>
      </section>
    </>
  );
}
