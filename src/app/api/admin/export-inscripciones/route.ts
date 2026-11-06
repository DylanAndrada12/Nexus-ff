import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { REGISTRATION_STATUSES, type RegistrationStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(fields: (string | number | null | undefined)[]): string {
  return fields.map(escapeCsv).join(",");
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("estado") ?? "ALL";
  const status =
    REGISTRATION_STATUSES.includes(statusParam as RegistrationStatus)
      ? statusParam
      : undefined;

  const registrations = await db.registration.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      team: { select: { name: true, tag: true } },
      tournament: { select: { name: true, slug: true } },
      captain: { select: { name: true, email: true } },
    },
    take: 5000,
  });

  const header = row([
    "ID",
    "Torneo",
    "Equipo",
    "Tag",
    "Capitán",
    "Email capitán",
    "Estado inscripción",
    "Fecha inscripción",
    "Fecha confirmación",
  ]);

  const lines = registrations.map((reg) =>
    row([
      reg.id,
      reg.tournament.name,
      reg.team.name,
      reg.team.tag,
      reg.captain.name,
      reg.captain.email,
      reg.status,
      reg.createdAt.toISOString(),
      reg.confirmedAt?.toISOString() ?? "",
    ]),
  );

  const csv = [header, ...lines].join("\r\n");
  const filename = `nexusff-inscripciones-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
