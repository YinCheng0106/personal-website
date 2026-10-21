import { describe, expect, test } from "bun:test";

import { getProjectGitHubStats } from "@/lib/github";
import { projectV2s } from "@/lib/project-v2-data";
import { validateProjectV2s, type ProjectV2 } from "@/lib/project-v2";
import {
  getPrimaryRepository,
  getProjectBySlug,
  getPublicProjects,
  getProjectRobotsMetadata,
  projects,
} from "@/lib/projects";

const legacySlugs = [
  "personal-website",
  "yinla-bot",
  "iso-countries-utils",
  "yinla-bot-website",
  "personai-api",
] as const;

// Checked against public GitHub repository pages during Phase 2-B1.
const verifiedPublicRepositories = new Set([
  "ExpTechTW/DPIP",
  "YinCheng0106/personal-website",
  "YinCheng0106/iso-countries-utils",
  "YinCheng0106/personai-web",
  "YinCheng0106/personai-api",
  "YinCheng0106/QuotaMew",
  "YinCheng0106/QuotaMew-docs",
  "YINLA-TEAM/YINLA",
  "YINLA-TEAM/yinla-bot-website",
]);

const baseProject = {
  id: "sample-project",
  slug: "sample-project",
  title: "Sample Project",
  summary: "Sample summary",
  presentation: { type: "app" },
  lifecycle: "active",
  publicationStatus: "published",
} satisfies ProjectV2;

describe("Project v2 portfolio integration", () => {
  test("publishes the five existing routes and two new products", () => {
    expect(projects).toHaveLength(7);
    for (const slug of legacySlugs) {
      expect(getProjectBySlug(slug)?.publicationStatus).toBe("published");
    }
    expect(getProjectBySlug("dpip")?.publicationStatus).toBe("published");
    expect(getProjectBySlug("quotamew")?.publicationStatus).toBe("published");
  });

  test("keeps existing repository links, slugs, and the YINLA legacy page", () => {
    const expectedLinks = {
      "personal-website": "YinCheng0106/personal-website",
      "yinla-bot": "YINLA-TEAM/YINLA",
      "iso-countries-utils": "YinCheng0106/iso-countries-utils",
      "yinla-bot-website": "YINLA-TEAM/yinla-bot-website",
      "personai-api": "YinCheng0106/personai-api",
    };
    for (const [slug, repository] of Object.entries(expectedLinks)) {
      const project = getProjectBySlug(slug);
      expect(
        project?.repositories?.some((repo) => repo.repository === repository),
      ).toBe(true);
    }
    expect(getProjectBySlug("yinla-bot-website")?.presentation.featured).toBe(
      false,
    );
    expect(
      getPrimaryRepository(getProjectBySlug("yinla-bot-website")!)?.repository,
    ).toBe("YINLA-TEAM/yinla-bot-website");
  });

  test("attributes DPIP widgets to an individual contributor within the ExpTechTW team", () => {
    const project = getProjectBySlug("dpip")!;
    expect(project.attribution).toEqual({
      kind: "team",
      name: "ExpTechTW",
      role: "Contributor — iOS weather widgets",
    });
    expect(project.summary).toContain("我參與 iOS 天氣小工具");
    expect(getPrimaryRepository(project)?.repository).toBe("ExpTechTW/DPIP");
    expect(project.contributionEvidence?.map(({ href }) => href)).toEqual(
      [576, 579, 580, 582, 607, 608, 629].map(
        (number) => `https://github.com/ExpTechTW/DPIP/pull/${number}`,
      ),
    );
  });

  test("presents PersonAI as a student-team web and API product", () => {
    const project = getProjectBySlug("personai-api")!;
    expect(project.title).toBe("PersonAI");
    expect(project.attribution).toEqual({
      kind: "team",
      name: "大學畢業專題學生團隊",
    });
    expect(project.summary).toContain("網頁前端與 FastAPI 後端");
    expect(project.repositories?.map(({ repository }) => repository)).toEqual([
      "YinCheng0106/personai-web",
      "YinCheng0106/personai-api",
    ]);
    expect(getPrimaryRepository(project)?.repository).toBe(
      "YinCheng0106/personai-web",
    );
  });

  test("presents QuotaMew with its application and documentation repositories", () => {
    const project = getProjectBySlug("quotamew")!;
    expect(project.summary).toContain("macOS 選單列");
    expect(project.summary).toContain("Claude Code 整合仍屬實驗性、未驗證");
    expect(project.repositories?.map(({ repository }) => repository)).toEqual([
      "YinCheng0106/QuotaMew",
      "YinCheng0106/QuotaMew-docs",
    ]);
    expect(getPrimaryRepository(project)?.repository).toBe(
      "YinCheng0106/QuotaMew",
    );
  });

  test("presents one featured YINLA product with Bot and Website sources", () => {
    const project = getProjectBySlug("yinla-bot")!;
    expect(project.attribution?.name).toBe("YINLA-TEAM");
    expect(project.repositories?.map(({ repository }) => repository)).toEqual([
      "YINLA-TEAM/YINLA",
      "YINLA-TEAM/yinla-bot-website",
    ]);
    expect(getPrimaryRepository(project)?.repository).toBe("YINLA-TEAM/YINLA");
    expect(project.contributionEvidence?.[0]?.href).toBe(
      "https://github.com/YINLA-TEAM/YINLA/blob/main/README.md#credits",
    );
  });

  test("features exactly DPIP, PersonAI, QuotaMew, and YINLA", () => {
    expect(
      projects
        .filter((project) => project.presentation.featured)
        .map((project) => project.title)
        .sort(),
    ).toEqual(["DPIP", "PersonAI", "QuotaMew", "YINLA"]);
    for (const slug of [
      "personal-website",
      "iso-countries-utils",
      "yinla-bot-website",
    ]) {
      expect(getProjectBySlug(slug)?.presentation.featured).toBe(false);
    }
  });

  test("publishes only the approved project inventory and public repositories", () => {
    expect(projectV2s.map((project) => project.slug).sort()).toEqual([
      "dpip",
      "iso-countries-utils",
      "personai-api",
      "personal-website",
      "quotamew",
      "yinla-bot",
      "yinla-bot-website",
    ]);
    for (const project of projects) {
      expect(project.repositories?.length).toBeGreaterThan(0);
      expect(
        project.repositories?.filter((repo) => repo.isPrimary),
      ).toHaveLength(1);
      for (const repo of project.repositories ?? []) {
        expect(verifiedPublicRepositories.has(repo.repository)).toBe(true);
      }
    }
    expect(() => validateProjectV2s(projectV2s)).not.toThrow();
  });

  test("adds no case studies or media and retains only the approved YINLA logo", () => {
    expect(projectV2s.every((project) => project.caseStudy === undefined)).toBe(
      true,
    );
    expect(projectV2s.filter((project) => project.media !== undefined)).toEqual(
      [getProjectBySlug("yinla-bot")!],
    );
    expect(getProjectBySlug("yinla-bot")?.media).toEqual({
      logo: "/projects/yinla-bot/logo.png",
    });
    for (const project of projectV2s) {
      for (const evidence of project.contributionEvidence ?? []) {
        expect(evidence.href.startsWith("https://github.com/")).toBe(true);
      }
    }
  });

  test("resolves project content when GitHub supplemental data is unavailable", async () => {
    const project = getProjectBySlug("personai-api")!;
    const stats = await getProjectGitHubStats(
      project,
      async () => new Response(null, { status: 503 }),
    );
    expect(stats).toBeNull();
    expect(getProjectBySlug(project.slug)?.summary).toBe(project.summary);
    expect(getPrimaryRepository(project)?.repository).toBe(
      "YinCheng0106/personai-web",
    );
  });

  test("allows published projects with zero repositories", () => {
    expect(getPrimaryRepository(baseProject)).toBeUndefined();
    expect(getPublicProjects([baseProject])).toEqual([baseProject]);
    expect(getProjectBySlug(baseProject.slug, [baseProject])).toBe(baseProject);
    expect(() => validateProjectV2s([baseProject])).not.toThrow();
  });

  test("supports multiple repositories and chooses only the explicit primary", () => {
    const project: ProjectV2 = {
      ...baseProject,
      repositories: [
        { provider: "github", repository: "example/first" },
        {
          provider: "github",
          repository: "example/primary",
          isPrimary: true,
        },
      ],
    };
    validateProjectV2s([project]);
    expect(getPrimaryRepository(project)?.repository).toBe("example/primary");

    const noPrimary: ProjectV2 = {
      ...project,
      repositories: [
        { provider: "github", repository: "example/first" },
        { provider: "github", repository: "example/second" },
      ],
    };
    expect(getPrimaryRepository(noPrimary)).toBeUndefined();
  });

  test("lists published projects, allows unlisted direct access, and hides drafts", () => {
    const published = baseProject;
    const unlisted: ProjectV2 = {
      ...baseProject,
      id: "unlisted-project",
      slug: "unlisted-project",
      publicationStatus: "unlisted",
    };
    const draft: ProjectV2 = {
      ...baseProject,
      id: "draft-project",
      slug: "draft-project",
      publicationStatus: "draft",
    };
    const privateProject: ProjectV2 = {
      ...baseProject,
      id: "private-project",
      slug: "private-project",
      publicationStatus: "private",
    };

    const allProjects = [published, unlisted, draft, privateProject];
    expect(getPublicProjects(allProjects)).toEqual([published]);
    expect(getProjectBySlug(unlisted.slug, allProjects)).toBe(unlisted);
    expect(getProjectRobotsMetadata(unlisted)).toEqual({
      index: false,
      follow: false,
    });
    expect(getProjectRobotsMetadata(published)).toBeUndefined();
    expect(getProjectBySlug(draft.slug, allProjects)).toBeUndefined();
    expect(getProjectBySlug(privateProject.slug, allProjects)).toBeUndefined();
  });

  test("rejects duplicate identities, slugs, repositories, and primary markers", () => {
    expect(() => validateProjectV2s([baseProject, baseProject])).toThrow(
      "duplicate project ID",
    );
    expect(() =>
      validateProjectV2s([baseProject, { ...baseProject, id: "other" }]),
    ).toThrow("duplicate project slug");
    expect(() =>
      validateProjectV2s([
        {
          ...baseProject,
          repositories: [
            {
              provider: "github",
              repository: "example/first",
              isPrimary: true,
            },
            {
              provider: "github",
              repository: "example/second",
              isPrimary: true,
            },
          ],
        },
      ]),
    ).toThrow("multiple primary repositories");
    expect(() =>
      validateProjectV2s([
        {
          ...baseProject,
          repositories: [
            { provider: "github", repository: "example/first" },
            { provider: "github", repository: "EXAMPLE/first" },
          ],
        },
      ]),
    ).toThrow("duplicate repository");
  });
});
