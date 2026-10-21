import { projectV2s } from "@/lib/project-v2-data";
import type { ProjectV2 } from "@/lib/project-v2";

export type { ProjectV2 as Project } from "@/lib/project-v2";

export const typeIcon: Record<string, string> = {
  website: "mdi:world-wide-web",
  bot: "mdi:robot-outline",
  app: "mdi:cellphone-iphone",
  tools: "mdi:tools",
  library: "mdi:library-books",
  package: "mdi:package-variant-closed",
  api: "mdi:gear",
};

/** Only published projects participate in public listings and discovery. */
export function getPublicProjects(
  allProjects: readonly ProjectV2[] = projectV2s,
): readonly ProjectV2[] {
  return allProjects.filter(
    (project) => project.publicationStatus === "published",
  );
}

export const projects = getPublicProjects();

/** Published projects are public; unlisted projects remain available by slug. */
export function getProjectBySlug(
  slug: string,
  allProjects: readonly ProjectV2[] = projectV2s,
): ProjectV2 | undefined {
  return allProjects.find(
    (project) =>
      project.slug === slug &&
      (project.publicationStatus === "published" ||
        project.publicationStatus === "unlisted"),
  );
}

/** A repository is primary only when the data explicitly marks it as such. */
export function getPrimaryRepository(project: ProjectV2) {
  return project.repositories?.find((repository) => repository.isPrimary);
}

export function getProjectRobotsMetadata(project: ProjectV2) {
  return project.publicationStatus === "unlisted"
    ? { index: false, follow: false }
    : undefined;
}
