import "server-only";

import { db } from "@/lib/db";

export type RankingRow = {
  teamId: string;
  name: string;
  tag: string;
  logoUrl: string | null;
  tournaments: number;
  points: number;
  kills: number;
  wins: number;
  top3: number;
  prize: number;
};

export async function getRanking(limit = 10): Promise<RankingRow[]> {
  const results = await db.tournamentResult.findMany({
    where: { tournament: { resultsPublishedAt: { not: null } } },
    select: {
      position: true,
      points: true,
      kills: true,
      prize: true,
      team: {
        select: { id: true, name: true, tag: true, logoUrl: true },
      },
    },
  });

  const map = new Map<string, RankingRow>();
  for (const result of results) {
    const current = map.get(result.team.id) ?? {
      teamId: result.team.id,
      name: result.team.name,
      tag: result.team.tag,
      logoUrl: result.team.logoUrl,
      tournaments: 0,
      points: 0,
      kills: 0,
      wins: 0,
      top3: 0,
      prize: 0,
    };

    current.tournaments += 1;
    current.points += result.points;
    current.kills += result.kills;
    current.prize += result.prize;
    if (result.position === 1) current.wins += 1;
    if (result.position <= 3) current.top3 += 1;
    map.set(result.team.id, current);
  }

  return [...map.values()]
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.wins - a.wins ||
        b.top3 - a.top3 ||
        b.kills - a.kills ||
        a.name.localeCompare(b.name),
    )
    .slice(0, limit);
}
