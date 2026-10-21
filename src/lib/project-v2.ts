/** Product metadata only. Long-form Case Study content lives elsewhere. */
export type ProjectV2 = {
  /** Stable identity, independent of the route slug. */
  id: string;
  slug: string;
  title: string;
  summary: string;
  presentation: {
    type: string;
    language?: string;
    color?: string;
    featured?: boolean;
  };
  lifecycle:
    | "unknown"
    | "planned"
    | "active"
    | "maintained"
    | "completed"
    | "archived";
  /** Phase 1-A sends only published records through the legacy pages. */
  publicationStatus: "published" | "unlisted" | "draft" | "private";
  attribution?:
    | { kind: "individual"; name: string; role?: string }
    | { kind: "team"; name: string; role?: string };
  /** Public repositories in display order. At most one may be primary. */
  repositories?: readonly {
    provider: "github";
    repository: string;
    isPrimary?: boolean;
  }[];
  media?: { logo?: string; image?: string };
  contributionEvidence?: readonly { label: string; href: string }[];
  caseStudy?: { href: string };
};

const projectKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const githubRepositoryPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

/** Validate hand-authored records before they reach the legacy adapter. */
export function validateProjectV2s(projects: readonly ProjectV2[]): void {
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const project of projects) {
    if (!projectKeyPattern.test(project.id) || ids.has(project.id)) {
      throw new Error(`Invalid or duplicate project ID: ${project.id}`);
    }
    if (!projectKeyPattern.test(project.slug) || slugs.has(project.slug)) {
      throw new Error(`Invalid or duplicate project slug: ${project.slug}`);
    }
    if (!project.title.trim() || !project.summary.trim()) {
      throw new Error(`Project ${project.id} needs a title and summary`);
    }
    ids.add(project.id);
    slugs.add(project.slug);

    const repositories = new Set<string>();
    let primaryCount = 0;
    for (const repo of project.repositories ?? []) {
      if (
        !githubRepositoryPattern.test(repo.repository) ||
        repositories.has(repo.repository.toLowerCase())
      ) {
        throw new Error(`Invalid or duplicate repository for ${project.id}`);
      }
      repositories.add(repo.repository.toLowerCase());
      if (repo.isPrimary) primaryCount += 1;
    }
    if (primaryCount > 1) {
      throw new Error(
        `Project ${project.id} has multiple primary repositories`,
      );
    }
  }
}
