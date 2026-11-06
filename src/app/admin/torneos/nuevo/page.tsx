import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/dal";
import { TournamentForm } from "@/components/admin/tournament-form";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Nuevo torneo · Administración" };
export const dynamic = "force-dynamic";

export default async function NewTournamentPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title="Nuevo torneo"
        description="Completá los datos reales del torneo. Todo lo publicado acá se muestra en el sitio."
        breadcrumb={
          <Link href="/admin/torneos" className="hover:text-white">
            ← Volver a torneos
          </Link>
        }
      />
      <TournamentForm />
    </>
  );
}
