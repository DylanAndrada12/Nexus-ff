import "server-only";

import { db } from "@/lib/db";

export async function getAdminOverview() {
  const now = new Date();
  const [
    users,
    teams,
    tournaments,
    confirmed,
    pending,
    openMessages,
    recentAudit,
    recentRegistrations,
    nextTournament,
  ] = await Promise.all([
    db.user.count(),
    db.team.count(),
    db.tournament.count(),
    db.registration.count({ where: { status: "CONFIRMED" } }),
    db.registration.count({ where: { status: "PENDING" } }),
    db.supportMessage.count({ where: { status: "OPEN" } }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { admin: { select: { name: true } } },
    }),
    db.registration.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        team: { select: { name: true, tag: true } },
        tournament: { select: { name: true, slug: true } },
      },
    }),
    db.tournament.findFirst({
      where: {
        startsAt: { gte: now },
        status: { in: ["UPCOMING", "REGISTRATION_OPEN", "FULL"] },
      },
      orderBy: { startsAt: "asc" },
      include: { registrations: { select: { status: true } } },
    }),
  ]);

  return {
    users,
    teams,
    tournaments,
    confirmed,
    pending,
    openMessages,
    recentAudit,
    recentRegistrations,
    nextTournament,
  };
}

export async function getAdminTournaments() {
  return db.tournament.findMany({
    orderBy: [{ startsAt: "desc" }],
    include: {
      _count: { select: { registrations: true, results: true } },
      room: { select: { id: true, published: true } },
    },
  });
}

export async function getAdminTournament(id: string) {
  return db.tournament.findUnique({
    where: { id },
    include: {
      room: true,
      invites: {
        include: {
          team: {
            select: {
              id: true,
              name: true,
              tag: true,
              captain: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      results: {
        include: { team: { select: { id: true, name: true, tag: true } } },
        orderBy: { position: "asc" },
      },
      registrations: {
        include: {
          team: {
            select: {
              id: true,
              name: true,
              tag: true,
              modality: true,
              members: {
                select: { gameName: true, uid: true, role: true },
                orderBy: { joinedAt: "asc" },
              },
            },
          },
          captain: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getAdminTeams() {
  return db.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      captain: { select: { id: true, name: true, email: true } },
      _count: { select: { members: true, registrations: true } },
    },
  });
}

export async function getAdminTeamOptionsForInvite(tournamentId: string) {
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { modality: true },
  });
  if (!tournament) return [];

  const teams = await db.team.findMany({
    where: {
      modality: tournament.modality,
      suspended: false,
      invites: { none: { tournamentId } },
      registrations: { none: { tournamentId } },
    },
    select: {
      id: true,
      name: true,
      tag: true,
      _count: { select: { members: true } },
    },
    orderBy: { name: "asc" },
  });

  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    tag: team.tag,
    members: team._count.members,
  }));
}

export async function getAdminTeam(id: string) {
  return db.team.findUnique({
    where: { id },
    include: {
      captain: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      },
      registrations: {
        include: {
          tournament: {
            select: { id: true, name: true, slug: true, startsAt: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getAdminRegistrations(status?: string, page = 1, perPage = 30) {
  const where = status && status !== "ALL" && status !== "TODOS" ? { status } : undefined;
  const [items, total] = await Promise.all([
    db.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        team: { select: { id: true, name: true, tag: true, suspended: true } },
        tournament: { select: { id: true, name: true, slug: true } },
        captain: { select: { id: true, name: true, email: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.registration.count({ where }),
  ]);
  return { items, total, totalPages: Math.ceil(total / perPage) };
}

export async function getAdminRegistrationTeamOptions(tournamentId: string) {
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { modality: true },
  });
  if (!tournament) return [];

  const teams = await db.team.findMany({
    where: { modality: tournament.modality, suspended: false },
    select: {
      id: true,
      name: true,
      tag: true,
      _count: { select: { members: true } },
      registrations: {
        where: { tournamentId },
        select: { status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return teams
    .filter((team) =>
      team.registrations.every((registration) => registration.status === "CANCELLED"),
    )
    .map((team) => ({
      id: team.id,
      name: team.name,
      tag: team.tag,
      members: team._count.members,
    }));
}

export async function getAdminUsers(page = 1, perPage = 40) {
  const [items, total] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        suspended: true,
        createdAt: true,
        _count: { select: { teamsLed: true, memberships: true } },
      },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.user.count(),
  ]);
  return { items, total, totalPages: Math.ceil(total / perPage) };
}

export async function getAdminAuditLogs() {
  return db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { name: true, email: true } } },
    take: 200,
  });
}

export async function getAdminSupportMessages() {
  return db.supportMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
}

export async function getAdminAnnouncements() {
  return db.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
}

export async function getAdminResultsTournaments() {
  return db.tournament.findMany({
    where: { status: { not: "CANCELLED" } },
    orderBy: [{ startsAt: "desc" }],
    include: {
      _count: { select: { results: true, registrations: true } },
    },
    take: 100,
  });
}

export async function getAdminSettingsPage() {
  const rows = await db.setting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<
    string,
    string
  >;
}
