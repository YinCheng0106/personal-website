import { describe, expect, test } from "bun:test";

import { projectV2s } from "@/lib/project-v2-data";
import { validateProjectV2s, type ProjectV2 } from "@/lib/project-v2";
import { projects, toLegacyProject, toLegacyProjects } from "@/lib/projects";

// Independent pre-migration fixture copied from src/lib/projects.ts at
// origin/main 7a4a184429145278d9980f18e520cdd89c44a35a. Never derive it
// from projectV2s or toLegacyProject: it protects the existing website output.
const legacyProjects = [
  {
    slug: "personal-website",
    type: "website",
    title: "Personal Website",
    description: "個人網頁 (本站)",
    github: "YinCheng0106/personal-website",
    language: "TypeScript",
    color: "blue",
    featured: true,
  },
  {
    slug: "yinla-bot",
    type: "bot",
    title: "YINLA",
    logo: "/projects/yinla-bot/logo.png",
    description:
      "這是一隻Discord的BOT，不定時會更新，主要功能是檢視天氣、檢視地震(含推播功能)、文字翻譯、查詢中油油價(含推播功能)以及查詢中華職棒相關的功能 ",
    github: "YINLA-TEAM/YINLA",
    language: "JavaScript",
    color: "yellow",
    featured: true,
  },
  {
    slug: "iso-countries-utils",
    type: "package",
    title: "iso-countries-utils",
    description:
      "一個輕量級、零依賴且型別安全的工具庫，用於轉換 ISO 3166-1 國家代碼（Alpha-2, Alpha-3, Numeric）與國旗 Emoji。專為高效能設計，並內建模糊搜尋與驗證功能",
    github: "YinCheng0106/iso-countries-utils",
    language: "TypeScript",
    color: "blue",
    featured: true,
  },
  {
    slug: "yinla-bot-website",
    type: "website",
    title: "yinla-bot-website",
    description: "YINLA Discord Bot 的官方網站",
    github: "YINLA-TEAM/yinla-bot-website",
    language: "TypeScript",
    color: "blue",
    featured: true,
  },
  {
    slug: "personai-api",
    type: "api",
    title: "personai-api",
    description:
      "AI 智慧健身教練後端服務 — 即時生物力學分析、動作計數與姿勢錯誤偵測",
    github: "YinCheng0106/personai-api",
    language: "Python",
    color: "blue",
    featured: true,
  },
];

const baseProject = {
  id: "sample-project",
  slug: "sample-project",
  title: "Sample Project",
  summary: "Sample summary",
  presentation: { type: "app" },
  lifecycle: "active",
  publicationStatus: "private",
} satisfies ProjectV2;

describe("Project v2 compatibility", () => {
  test("maps all five existing projects without changing legacy card or page fields", () => {
    expect(projects).toEqual(legacyProjects);
    expect(projectV2s).toHaveLength(5);
  });

  test("preserves every legacy slug and project URL", () => {
    expect(projectV2s.map((project) => project.slug)).toEqual(
      legacyProjects.map((project) => project.slug),
    );
    expect(projectV2s.map((project) => `/projects/${project.slug}`)).toEqual(
      legacyProjects.map((project) => `/projects/${project.slug}`),
    );
    expect(projectV2s.map((project) => project.id)).toEqual([
      "personal-website",
      "yinla-bot",
      "iso-countries-utils",
      "yinla-bot-website",
      "personai-api",
    ]);
  });

  test("allows a v2 project without public repositories", () => {
    const project: ProjectV2 = baseProject;
    expect(project.repositories).toBeUndefined();
    expect(() => toLegacyProject(project)).toThrow(
      "Legacy project sample-project must be published",
    );
  });

  test("supports multiple ordered repositories and an explicit legacy primary", () => {
    const project: ProjectV2 = {
      ...baseProject,
      publicationStatus: "published",
      repositories: [
        { provider: "github", repository: "example/companion" },
        { provider: "github", repository: "example/primary", isPrimary: true },
      ],
    };
    validateProjectV2s([project]);
    expect(project.repositories).toHaveLength(2);
    expect(project.repositories?.map((repo) => repo.repository)).toEqual([
      "example/companion",
      "example/primary",
    ]);
    expect(toLegacyProject(project).github).toBe("example/primary");
  });

  test("uses the first repository when no primary is marked", () => {
    const project: ProjectV2 = {
      ...baseProject,
      publicationStatus: "published",
      repositories: [
        { provider: "github", repository: "example/first" },
        { provider: "github", repository: "example/second" },
      ],
    };
    expect(toLegacyProject(project).github).toBe("example/first");
  });

  test("keeps unlisted, draft, and private records out of legacy pages", () => {
    const published: ProjectV2 = {
      ...baseProject,
      publicationStatus: "published",
      repositories: [{ provider: "github", repository: "example/public" }],
    };
    const hidden = (["unlisted", "draft", "private"] as const).map(
      (publicationStatus) => ({ ...published, publicationStatus }),
    );
    expect(toLegacyProjects([published, ...hidden])).toEqual([
      toLegacyProject(published),
    ]);
    for (const project of hidden) {
      expect(() => toLegacyProject(project)).toThrow("must be published");
    }
  });

  test("rejects a published record without a legacy GitHub repository", () => {
    const project: ProjectV2 = {
      ...baseProject,
      publicationStatus: "published",
    };
    expect(() => toLegacyProject(project)).toThrow(
      "Legacy project sample-project requires a public GitHub repository",
    );
  });

  test("rejects duplicate IDs, slugs, repositories, and primary markers", () => {
    const project: ProjectV2 = {
      ...baseProject,
      repositories: [
        { provider: "github", repository: "example/first", isPrimary: true },
        { provider: "github", repository: "example/second", isPrimary: true },
      ],
    };
    expect(() => validateProjectV2s([baseProject, baseProject])).toThrow(
      "duplicate project ID",
    );
    expect(() =>
      validateProjectV2s([baseProject, { ...baseProject, id: "other" }]),
    ).toThrow("duplicate project slug");
    expect(() => validateProjectV2s([project])).toThrow(
      "multiple primary repositories",
    );
    expect(() =>
      validateProjectV2s([
        {
          ...project,
          repositories: [
            { provider: "github", repository: "example/first" },
            { provider: "github", repository: "EXAMPLE/first" },
          ],
        },
      ]),
    ).toThrow("duplicate repository");
  });

  test("represents individual and team attribution independently of lifecycle and publication", () => {
    const individual: ProjectV2 = {
      ...baseProject,
      attribution: { kind: "individual", name: "Example Author" },
    };
    const team: ProjectV2 = {
      ...baseProject,
      attribution: { kind: "team", name: "Example Team", role: "Contributor" },
      publicationStatus: "published",
    };

    expect(individual.attribution?.kind).toBe("individual");
    expect(team.attribution?.kind).toBe("team");
    expect(individual.lifecycle).toBe(team.lifecycle);
    expect(individual.publicationStatus).not.toBe(team.publicationStatus);
  });
});
