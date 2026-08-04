import { queryOptions } from "@tanstack/react-query";
import { listProjects, getProjectBySlug } from "@/lib/projects.functions";
import { listCertificates } from "@/lib/certificates.functions";
import { listSkillGroups } from "@/lib/skills.functions";
import { listExperiences } from "@/lib/experiences.functions";

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
