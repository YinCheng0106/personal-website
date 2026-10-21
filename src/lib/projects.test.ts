import { describe, expect, test } from "bun:test";

import { projectV2s } from "@/lib/project-v2-data";
import { validateProjectV2s, type ProjectV2 } from "@/lib/project-v2";
import {
  getPrimaryRepository,
  getProjectBySlug,
  getPublicProjects,
  getProjectRobotsMetadata,
  projects,
} from "@/lib/projects";

// Independent pre-migration fixture protects all existing visible project data.
const legacyProjects = [
  {
    slug: "personal-website",
    type: "website",
    title: "Personal Website",
    summary: "個人網頁 (本站)",
    repository: "YinCheng0106/personal-website",
    language: "TypeScript",
    color: "blue",
    featured: true,
    logo: undefined,
  },
  {
    slug: "yinla-bot",
    type: "bot",
    title: "YINLA",
    summary:
      "這是一隻Discord的BOT，不定時會更新，主要功能是檢視天氣、檢視地震(含推播功能)、文字翻譯、查詢中油油價(含推播功能)以及查詢中華職棒相關的功能 ",
    repository: "YINLA-TEAM/YINLA",
    language: "JavaScript",
    color: "yellow",
    featured: true,
    logo: "/projects/yinla-bot/logo.png",
  },
  {
    slug: "iso-countries-utils",
    type: "package",
    title: "iso-countries-utils",
    summary:
      "一個輕量級、零依賴且型別安全的工具庫，用於轉換 ISO 3166-1 國家代碼（Alpha-2, Alpha-3, Numeric）與國旗 Emoji。專為高效能設計，並內建模糊搜尋與驗證功能",
    repository: "YinCheng0106/iso-countries-utils",
    language: "TypeScript",
    color: "blue",
    featured: true,
    logo: undefined,
  },
  {
    slug: "yinla-bot-website",
    type: "website",
    title: "yinla-bot-website",
    summary: "YINLA Discord Bot 的官方網站",
    repository: "YINLA-TEAM/yinla-bot-website",
    language: "TypeScript",
    color: "blue",
    featured: true,
    logo: undefined,
  },
  {
    slug: "personai-api",
    type: "api",
    title: "personai-api",
    summary: "AI 智慧健身教練後端服務 — 即時生物力學分析、動作計數與姿勢錯誤偵測",
    repository: "YinCheng0106/personai-api",
    language: "Python",
    color: "blue",
    featured: true,
    logo: undefined,
  },
];

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
  test("preserves all five existing projects and their visible fields", () => {
    expect(projects).toHaveLength(5);
    expect(
      projects.map((project) => ({
        slug: project.slug,
        type: project.presentation.type,
        title: project.title,
        summary: project.summary,
        repository: getPrimaryRepository(project)?.repository,
        language: project.presentation.language,
        color: project.presentation.color,
        featured: project.presentation.featured,
        logo: project.media?.logo,
      })),
    ).toEqual(legacyProjects);
  });

  test("keeps all five route slugs stable", () => {
    expect(projectV2s.map((project) => project.slug)).toEqual(
      legacyProjects.map((project) => project.slug),
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
            { provider: "github", repository: "example/first", isPrimary: true },
            { provider: "github", repository: "example/second", isPrimary: true },
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
