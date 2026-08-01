import { queryOptions } from "@tanstack/react-query";
import { listProjects, getProjectBySlug } from "@/lib/projects.functions";

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: () => listProjects(),
});

export const projectQuery = (slug: string) =>
  queryOptions({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug({ data: { slug } }),
  });
