import { describe, expect, mock, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";

import { projectV2s } from "@/lib/project-v2-data";
import type { ProjectV2 } from "@/lib/project-v2";
import { getProjectBySlug, getPublicProjects } from "@/lib/projects";

// Next enforces this poison import at its Client Component boundary. Bun has no
// Next module graph; disable only the marker, retaining the real reader/compiler.
mock.module("server-only", () => ({}));
const {
  getCaseStudyAvailability,
  getPublicCaseStudy,
  getPublicCaseStudyBySlug,
  getPublicCaseStudies,
  isCaseStudyPublicationEligible,
  validateCaseStudyContent,
} = await import("@/lib/case-studies");

const { default: CaseStudyPage, generateMetadata: articleMetadata } =
  await import("@/app/(main)/projects/[slug]/case-study/page");
const { default: sitemap } = await import("@/app/sitemap");
const { generateMetadata } = await import("@/app/(main)/projects/[slug]/page");

const pilot = projectV2s.find(({ id }) => id === "quotamew")!;
const marker = "CASE_STUDY_QUOTAMEW_INTERNAL_FIXTURE";

describe("trusted Case Study infrastructure", () => {
  test("looks up QuotaMew by the canonical Project v2 ID", async () => {
    expect(pilot.id).toBe("quotamew");
    expect(await getCaseStudyAvailability(pilot.id)).toEqual({
      hasContent: true,
      publicationEligible: true,
    });
    // PersonAI's product title differs from its stable ID; neither is inferred.
    expect(await validateCaseStudyContent("PersonAI")).toBe("missing");
    expect(await validateCaseStudyContent("personai-api")).toBe("missing");
  });

  test("renders the approved first-person article with qualified memory observations", async () => {
    expect(await validateCaseStudyContent(pilot.id)).toBe("valid");
    const source = await fs.readFile(
      "src/contents/case-studies/quotamew.mdx",
      "utf8",
    );
    const article = await getPublicCaseStudy(pilot.id);
    expect(article?.project).toBe(pilot);
    const html = renderToStaticMarkup(article!.content);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html.match(/<h2\b/g)).toHaveLength(9);
    for (const text of [
      "其實一開始，我沒有特別打算要開發 macOS App。",
      "這個專案的大部分程式碼其實是由 AI 協助完成的",
      "Swift 和 SwiftUI",
      "codex app-server",
      "stdio",
      "實驗性、尚未完整驗證",
      "Apple Developer Program",
      "約略記憶體用量",
      "12 MB",
      "50 MB",
      "這些數字只是開發期間的初步觀察",
      "還沒有做完整的效能基準測試",
      "也不能直接拿來證明 QuotaMew 比其他監測工具更省記憶體",
      "這些目前都還只是規劃",
    ])
      expect(html).toContain(text);
    expect(html).toContain('role="region"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('scope="col"');
    expect(html).toContain(
      'href="https://github.com/YinCheng0106/QuotaMew-docs"',
    );
    expect(html).not.toContain(marker);
    expect(html).not.toContain("synthetic fixture");
    expect(source).not.toMatch(/^---/);
    expect(source).not.toMatch(/\/Users\/|\/home\/|data-case-study-fixture/);
  });

  test("uses the stable ID even if a product slug changes", async () => {
    const slug = pilot.slug;
    pilot.slug = "renamed-product";
    try {
      expect((await getCaseStudyAvailability(pilot.id)).hasContent).toBe(true);
      expect((await getCaseStudyAvailability(pilot.slug)).hasContent).toBe(
        false,
      );
    } finally {
      pilot.slug = slug;
    }
  });

  test("rejects invalid IDs, inherited keys, raw content and traversal without I/O", async () => {
    const read = spyOn(fs, "readFile");
    try {
      for (const id of [
        "../quotamew",
        "../../.env",
        "/etc/passwd",
        "quotamew.mdx",
        "%2e%2e%2fquotamew",
        "quotamew/../quotamew",
        "quotamew\\..\\.env",
        "quotamew\0",
        "quotamew?preview=true",
        "QUOTAMEW",
        "__proto__",
        "constructor",
        "toString",
        "",
        null,
        undefined,
        7,
        { id: "quotamew", source: "{process.env.SECRET}" },
      ]) {
        expect(await getPublicCaseStudy(id)).toBeNull();
        expect(await validateCaseStudyContent(id)).toBe("missing");
        expect(await getCaseStudyAvailability(id)).toEqual({
          hasContent: false,
          publicationEligible: false,
        });
      }
      expect(read).not.toHaveBeenCalled();
    } finally {
      read.mockRestore();
    }
  });

  test("blocks draft, private and unlisted products before reading or discovery", async () => {
    const previous = pilot.publicationStatus;
    const read = spyOn(fs, "readFile");
    try {
      for (const status of ["draft", "private", "unlisted"] as const) {
        pilot.publicationStatus = status;
        expect(await getPublicCaseStudy(pilot.id)).toBeNull();
        expect(await getPublicCaseStudyBySlug(pilot.slug)).toBeNull();
        expect(await getPublicCaseStudies()).toEqual([]);
        expect(
          (await sitemap()).some(({ url }) => url.endsWith("/case-study")),
        ).toBe(false);
        await expect(
          CaseStudyPage({ params: Promise.resolve({ slug: pilot.slug }) }),
        ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
      }
      expect(read).not.toHaveBeenCalled();
    } finally {
      pilot.publicationStatus = previous;
      read.mockRestore();
    }
  });

  test("requires both explicit approval and published product visibility", () => {
    for (const publicationStatus of [
      "published",
      "unlisted",
      "draft",
      "private",
    ] as const) {
      const project: ProjectV2 = { ...pilot, publicationStatus };
      expect(isCaseStudyPublicationEligible(project, "draft")).toBe(false);
      expect(isCaseStudyPublicationEligible(project, "approved")).toBe(
        publicationStatus === "published",
      );
    }
  });

  test("keeps published projects with no article, media or repositories valid", async () => {
    const project = projectV2s.find(({ id }) => id === "dpip")!;
    expect(project.media).toBeUndefined();
    expect(getProjectBySlug(project.slug)).toBe(project);
    expect(await getPublicCaseStudy(project.id)).toBeNull();
    expect(await validateCaseStudyContent(project.id)).toBe("missing");
    expect(await getCaseStudyAvailability(project.id)).toEqual({
      hasContent: false,
      publicationEligible: false,
    });
    const noRepositories: ProjectV2 = { ...project, repositories: [] };
    expect(getPublicProjects([noRepositories])).toEqual([noRepositories]);
    expect(
      projectV2s.some(({ repositories }) => (repositories?.length ?? 0) > 1),
    ).toBe(true);
  });

  test("treats missing, unreadable and empty files as unavailable without error details", async () => {
    const read = spyOn(fs, "readFile");
    try {
      for (const code of ["ENOENT", "EACCES"]) {
        read.mockRejectedValue(
          Object.assign(new Error("internal path detail"), { code }),
        );
        expect(await validateCaseStudyContent(pilot.id)).toBe("missing");
        expect(await getCaseStudyAvailability(pilot.id)).toEqual({
          hasContent: false,
          publicationEligible: true,
        });
        expect(await getPublicCaseStudy(pilot.id)).toBeNull();
      }
      read.mockResolvedValue("  \n");
      expect(await validateCaseStudyContent(pilot.id)).toBe("missing");
    } finally {
      read.mockRestore();
    }
  });

  test("fails closed on malformed local MDX", async () => {
    const read = spyOn(fs, "readFile").mockResolvedValue(
      "# Valid title\n\n<Unclosed",
    );
    try {
      expect(await validateCaseStudyContent(pilot.id)).toBe("invalid");
      expect(await getPublicCaseStudy(pilot.id)).toBeNull();
    } finally {
      read.mockRestore();
    }
  });

  test("never interprets caseStudy.href as a file path or a publication approval", async () => {
    const previous = pilot.caseStudy;
    pilot.caseStudy = { href: "../../.env" };
    try {
      expect(await validateCaseStudyContent(pilot.id)).toBe("valid");
      expect((await getPublicCaseStudy(pilot.id))?.href).toBe(
        "/projects/quotamew/case-study",
      );
    } finally {
      pilot.caseStudy = previous;
    }
  });

  test("does not consult GitHub for local content availability or compilation", async () => {
    const fetch = spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("GitHub unavailable"),
    );
    try {
      expect(await getCaseStudyAvailability(pilot.id)).toEqual({
        hasContent: true,
        publicationEligible: true,
      });
      expect(await validateCaseStudyContent(pilot.id)).toBe("valid");
      const page = await CaseStudyPage({
        params: Promise.resolve({ slug: pilot.slug }),
      });
      expect(renderToStaticMarkup(page)).toContain(
        "我沒有打算把它包裝成一個全部由自己手寫的專案",
      );
      expect(
        (
          await articleMetadata({
            params: Promise.resolve({ slug: pilot.slug }),
          })
        ).openGraph,
      ).toMatchObject({ type: "article" });
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      fetch.mockRestore();
    }
  });

  test("publishes only the QuotaMew article and preserves project metadata", async () => {
    const urls = (await sitemap()).map(({ url }) => url);
    expect(urls.filter((url) => /\/projects\/[^/]+$/.test(url))).toHaveLength(
      6,
    );
    expect(urls.filter((url) => url.includes("/case-study"))).toEqual([
      "https://yincheng.app/projects/quotamew/case-study",
    ]);
    expect(
      (await getPublicCaseStudies()).map(({ project }) => project.id),
    ).toEqual(["quotamew"]);
    for (const project of projectV2s) {
      if (project.id !== pilot.id) {
        expect(await getPublicCaseStudy(project.id)).toBeNull();
        await expect(
          CaseStudyPage({ params: Promise.resolve({ slug: project.slug }) }),
        ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        await expect(
          articleMetadata({ params: Promise.resolve({ slug: project.slug }) }),
        ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
      }
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: project.slug }),
      });
      expect(metadata.description).toBe(project.summary);
      expect(JSON.stringify(metadata)).not.toMatch(
        /case-studies|CASE_STUDY_|\/Users\//,
      );
    }
  });

  test("derives article metadata from approved source and canonical Project v2", async () => {
    const article = (await getPublicCaseStudy(pilot.id))!;
    const metadata = await articleMetadata({
      params: Promise.resolve({ slug: pilot.slug }),
    });
    expect(metadata.title).toBe(
      "QuotaMew｜因為一個太吃記憶體的工具，我決定自己做一個 macOS App",
    );
    expect(metadata.description).toBe(
      `${pilot.summary} 其實一開始，我沒有特別打算要開發 macOS App。`,
    );
    expect(metadata.alternates?.canonical).toBe(
      `https://yincheng.app${article.href}`,
    );
    expect(metadata.openGraph?.url).toBe(`https://yincheng.app${article.href}`);
    expect(metadata.openGraph).toMatchObject({ type: "article" });
    expect(metadata.twitter?.title).toBe(article.title);
    expect(metadata.twitter?.description).toBe(article.description);
    expect(metadata.twitter?.images).toEqual([
      "https://yincheng.app/projects/quotamew/og",
    ]);
    const page = await CaseStudyPage({
      params: Promise.resolve({ slug: pilot.slug }),
    });
    expect(renderToStaticMarkup(page)).toContain('href="/projects/quotamew"');
  });

  test("returns 404 for missing content without metadata, paths or discovery links", async () => {
    const read = spyOn(fs, "readFile").mockRejectedValue(
      new Error("/Users/private/internal.mdx"),
    );
    try {
      expect(await getPublicCaseStudy(pilot.id)).toBeNull();
      expect(await getPublicCaseStudies()).toEqual([]);
      expect(
        (await sitemap()).some(({ url }) => url.endsWith("/case-study")),
      ).toBe(false);
      await expect(
        CaseStudyPage({ params: Promise.resolve({ slug: pilot.slug }) }),
      ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
      await expect(
        articleMetadata({ params: Promise.resolve({ slug: pilot.slug }) }),
      ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    } finally {
      read.mockRestore();
    }
  });
});
