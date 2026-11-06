import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { createTeamAction } from "@/actions/teams";
import { ActionForm } from "@/components/forms/action-form";
import { ImageUploadField } from "@/components/forms/image-upload-field";
import { PageHeader } from "@/components/ui";
import { MODALITIES, MODALITY_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Nuevo equipo" };
export const dynamic = "force-dynamic";

export default async function NewTeamPage() {
  const user = await requireUser("/panel/equipos/nuevo");

  return (
    <>
      <PageHeader
        title="Crear equipo"
        description="El equipo queda asociado a tu cuenta como capitán. Después vas a poder completar la plantilla."
        breadcrumb={
          <Link href="/panel/equipos" className="hover:text-white">
            ← Volver a mis equipos
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-6 md:p-7">
          <ActionForm
            action={createTeamAction}
            submitLabel="Crear equipo"
            pendingLabel="Creando…"
            buttonFull
          >
            <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
              <div className="field">
                <label htmlFor="team-name" className="label">
                  Nombre del equipo
                </label>
                <input
                  id="team-name"
                  name="name"
                  required
                  minLength={3}
                  maxLength={30}
                  className="input"
                  placeholder="Ej.: Fénix Esports"
                />
                <span className="hint">Entre 3 y 30 caracteres.</span>
              </div>
              <div className="field">
                <label htmlFor="team-tag" className="label">
                  Etiqueta
                </label>
                <input
                  id="team-tag"
                  name="tag"
                  required
                  minLength={2}
                  maxLength={5}
                  className="input uppercase"
                  placeholder="FENIX"
                />
                <span className="hint">2 a 5 letras o números.</span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="team-modality" className="label">
                Modalidad
              </label>
              <select id="team-modality" name="modality" className="select" required>
                {MODALITIES.map((modality) => (
                  <option key={modality} value={modality}>
                    {MODALITY_LABELS[modality]}
                  </option>
                ))}
              </select>
              <span className="hint">
                No se puede cambiar la modalidad si el equipo tiene inscripciones activas.
              </span>
            </div>

            <ImageUploadField name="logoUrl" label="Logo del equipo (opcional)" />

            <div className="border-t border-line pt-5">
              <h2 className="text-sm font-semibold">Capitán como jugador</h2>
              <p className="mt-1 text-xs text-muted">
                Tu cuenta es la capitana. Ingresá tu nombre dentro del juego y tu UID
                de Free Fire. El UID no se puede repetir.
              </p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div className="field">
                  <label htmlFor="team-game-name" className="label">
                    Nombre en el juego
                  </label>
                  <input
                    id="team-game-name"
                    name="gameName"
                    required
                    minLength={2}
                    maxLength={24}
                    className="input"
                    placeholder="Tu nick de Free Fire"
                  />
                </div>
                <div className="field">
                  <label htmlFor="team-uid" className="label">
                    UID de Free Fire
                  </label>
                  <input
                    id="team-uid"
                    name="uid"
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6,20}"
                    className="input mono"
                    placeholder="123456789"
                  />
                  <span className="hint">Entre 6 y 20 dígitos.</span>
                </div>
              </div>
            </div>
          </ActionForm>
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <h2 className="text-sm font-semibold">Antes de crear</h2>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
              <li>El nombre y la etiqueta deben ser únicos en la plataforma.</li>
              <li>Tu cuenta pasa a rol capitán automáticamente.</li>
              <li>Podés subir un logo PNG, JPG o WEBP de hasta 2 MB.</li>
              <li>
                Para competir, la plantilla tiene que estar completa según la modalidad.
              </li>
            </ul>
          </div>
          <div className="panel p-5">
            <p className="mono text-[10px] text-muted">Cuenta</p>
            <p className="mt-2 text-sm">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
