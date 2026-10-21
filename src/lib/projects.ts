import { projectV2s } from "@/lib/project-v2-data";
import type { ProjectV2 } from "@/lib/project-v2";

export type Project = {
  slug: string;
  title: string;
  logo?: string;
  type: string;
  description: string;
  github: string;
  stars?: number;
  forks?: number;
  language?: string;
  color?: string;
  image?: string;
  featured?: boolean;
};

export const typeIcon: Record<string, string> = {
  website: "mdi:world-wide-web",
  bot: "mdi:robot-outline",
  app: "mdi:cellphone-iphone",
  tools: "mdi:tools",
  library: "mdi:library-books",
  package: "mdi:package-variant-closed",
  api: "mdi:gear",
};

/** Compatibility boundary for the existing GitHub-backed project pages. */
export function toLegacyProject(project: ProjectV2): Project {
  if (project.publicationStatus !== "published") {
    throw new Error(`Legacy project ${project.id} must be published`);
  }
  const primaryGitHub =
    project.repositories?.find((repo) => repo.isPrimary) ??
    project.repositories?.[0];
  if (!primaryGitHub) {
    throw new Error(
      `Legacy project ${project.id} requires a public GitHub repository`,
    );
  }

  return {
    slug: project.slug,
    title: project.title,
    type: project.presentation.type,
    description: project.summary,
    github: primaryGitHub.repository,
    ...(project.media?.logo !== undefined && { logo: project.media.logo }),
    ...(project.media?.image !== undefined && { image: project.media.image }),
    ...(project.presentation.language !== undefined && {
      language: project.presentation.language,
    }),
    ...(project.presentation.color !== undefined && {
      color: project.presentation.color,
    }),
    ...(project.presentation.featured !== undefined && {
      featured: project.presentation.featured,
    }),
  };
}

export function toLegacyProjects(projects: readonly ProjectV2[]): Project[] {
  return projects
    .filter((project) => project.publicationStatus === "published")
    .map(toLegacyProject);
}

export const projects: Project[] = toLegacyProjects(projectV2s);
