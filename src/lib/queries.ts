import { queryOptions } from "@tanstack/react-query";
import { listProjects, getProjectBySlug } from "@/lib/projects.functions";
import { listCertificates } from "@/lib/certificates.functions";
import { listSkillGroups } from "@/lib/skills.functions";
import { listExperiences } from "@/lib/experiences.functions";
import { getLeaderboard } from "@/lib/games.functions";
import { getUptime } from "@/lib/uptime.functions";

export const skillGroupsQuery = queryOptions({
  queryKey: ["skill-groups"],
  queryFn: () => listSkillGroups(),
});

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: () => listProjects(),
});

export const projectQuery = (slug: string) =>
  queryOptions({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug({ data: { slug } }),
  });

export const certificatesQuery = queryOptions({
  queryKey: ["certificates"],
  queryFn: () => listCertificates(),
});

export const experiencesQuery = queryOptions({
  queryKey: ["experiences"],
  queryFn: () => listExperiences(),
});

export const leaderboardQuery = (game: string) =>
  queryOptions({
    queryKey: ["leaderboard", game],
    queryFn: () => getLeaderboard({ data: { game } }),
    staleTime: 60 * 1000,
  });

/**
 * Live-site health. The server caches for five minutes; matching that here
 * stops a client-side refetch asking a question the server will only answer
 * from cache anyway.
 */
export const uptimeQuery = queryOptions({
  queryKey: ["uptime"],
  queryFn: () => getUptime(),
  staleTime: 5 * 60 * 1000,
});
