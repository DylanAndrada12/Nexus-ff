import "server-only";

import { db } from "@/lib/db";
import {
  occupancyFrom,
  effectiveStatus,
  registrationWindowOpen,
} from "@/lib/tournaments";
import type { TournamentCard } from "@/lib/queries/public";
import type { Modality, TournamentStatus } from "@/lib/constants";

export async function getTeamsForUser(userId: string) {
  const [owned, memberships] = await Promise.all([
    db.team.findMany({
      where: { captainId: userId },
      include: {
        _count: { select: { members: true, registrations: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.team.findMany({
      where: {
        captainId: { not: userId },
        members: { some: { userId } },
      },
      include: {
        _count: { select: { members: true, registrations: true } },
        captain: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { owned, memberships };
}

export async function getTeamDetail(id: string, viewer: { id: string; role: string }) {
  const team = await db.team.findUnique({
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
            select: {
              id: true,
              name: true,
              slug: true,
              startsAt: true,
              status: true,
              modality: true,
              resultsPublishedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!team) return null;
  const canManage = viewer.role === "ADMIN" || team.captainId === viewer.id;
  const isMember = team.members.some((member) => member.userId === viewer.id);
  if (!canManage && !isMember) return null;
  return { team, canManage };
}

export async function getCaptainTournaments(userId: string): Promise<
  (TournamentCard & { invited: boolean })[]
> {
  const now = new Date();
  const [publicTournaments, privateInvites] = await Promise.all([
    db.tournament.findMany({
      where: {
        access: "PUBLIC",
        status: { in: ["UPCOMING", "REGISTRATION_OPEN", "FULL"] },
        startsAt: { gte: now },
      },
      include: { registrations: { select: { status: true } } },
      orderBy: { startsAt: "asc" },
      take: 40,
    }),
    db.tournamentInvite.findMany({
      where: {
        team: { captainId: userId },
        tournament: {
          access: "PRIVATE",
          status: { in: ["UPCOMING", "REGISTRATION_OPEN", "FULL"] },
          startsAt: { gte: now },
        },
      },
      include: {
        tournament: {
          include: {
            registrations: { select: { status: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const map = new Map<string, TournamentCard & { invited: boolean }>();
  for (const tournament of publicTournaments) {
    const occupancy = occupancyFrom(tournament.registrations, tournament.maxTeams);
    const window = registrationWindowOpen(tournament, occupancy, now);
    map.set(tournament.id, {
      id: tournament.id,
      slug: tournament.slug,
      name: tournament.name,
      bannerUrl: tournament.bannerUrl,
      description: tournament.description,
      modality: tournament.modality as Modality,
      access: tournament.access,
      status: effectiveStatus(tournament, occupancy) as TournamentStatus,
      startsAt: tournament.startsAt,
      maxTeams: tournament.maxTeams,
      prizePool: tournament.prizePool,
      featured: tournament.featured,
      occupancy,
      registrationOpen: window.open,
      registrationReason: window.reason,
      invited: false,
    });
  }
  for (const invite of privateInvites) {
    const tournament = invite.tournament;
    if (map.has(tournament.id)) continue;
    const occupancy = occupancyFrom(tournament.registrations, tournament.maxTeams);
    const window = registrationWindowOpen(tournament, occupancy, now);
    map.set(tournament.id, {
      id: tournament.id,
      slug: tournament.slug,
      name: tournament.name,
      bannerUrl: tournament.bannerUrl,
      description: tournament.description,
      modality: tournament.modality as Modality,
      access: tournament.access,
      status: effectiveStatus(tournament, occupancy) as TournamentStatus,
      startsAt: tournament.startsAt,
      maxTeams: tournament.maxTeams,
      prizePool: tournament.prizePool,
      featured: tournament.featured,
      occupancy,
      registrationOpen: window.open,
      registrationReason: window.reason,
      invited: true,
    });
  }

  return [...map.values()].sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
  );
}

export async function getCaptainRegistrations(userId: string) {
  return db.registration.findMany({
    where: { captainId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
          slug: true,
          startsAt: true,
          status: true,
          modality: true,
          access: true,
          resultsPublishedAt: true,
          room: { select: { published: true } },
        },
      },
      team: { select: { id: true, name: true, tag: true, logoUrl: true } },
    },
  });
}

export async function getCaptainRooms(userId: string) {
  return db.registration.findMany({
    where: {
      captainId: userId,
      status: "CONFIRMED",
      tournament: { room: { published: true } },
    },
    include: {
      tournament: {
        include: { room: true },
      },
      team: { select: { name: true, tag: true } },
    },
    orderBy: { tournament: { startsAt: "asc" } },
  });
}

export async function getCaptainHistory(userId: string) {
  return db.tournamentResult.findMany({
    where: {
      tournament: { resultsPublishedAt: { not: null } },
      team: { captainId: userId },
    },
    include: {
      tournament: {
        select: { id: true, name: true, slug: true, startsAt: true },
      },
      team: { select: { id: true, name: true, tag: true, logoUrl: true } },
    },
    orderBy: { tournament: { startsAt: "desc" } },
  });
}

export async function getCaptainNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}

export async function getCaptainOverview(userId: string) {
  const now = new Date();
  const [teams, activeRegistrations, unread, nextRegistration] = await Promise.all([
    db.team.count({ where: { captainId: userId } }),
    db.registration.count({
      where: {
        captainId: userId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    getUnreadNotificationCount(userId),
    db.registration.findFirst({
      where: {
        captainId: userId,
        status: { in: ["PENDING", "CONFIRMED"] },
        tournament: { startsAt: { gte: now }, status: { not: "CANCELLED" } },
      },
      orderBy: { tournament: { startsAt: "asc" } },
      include: {
        tournament: { select: { id: true, name: true, slug: true, startsAt: true } },
        team: { select: { name: true, tag: true } },
      },
    }),
  ]);

  return { teams, activeRegistrations, unread, nextRegistration };
}

export async function getPrivateInviteOptions(userId: string) {
  const invites = await db.tournamentInvite.findMany({
    where: {
      team: { captainId: userId },
      tournament: {
        access: "PRIVATE",
        startsAt: { gte: new Date() },
        status: { in: ["UPCOMING", "REGISTRATION_OPEN", "FULL"] },
      },
    },
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
          slug: true,
          startsAt: true,
          status: true,
          modality: true,
        },
      },
      team: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return invites.filter((invite) => invite.tournament !== null);
}
