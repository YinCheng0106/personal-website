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
const dpip = projectV2s.find(({ id }) => id === "dpip")!;
const personai = projectV2s.find(({ id }) => id === "personai-api")!;
const approved = [dpip, personai, pilot];
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
    expect(await validateCaseStudyContent("personai-api")).toBe("valid");
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

  test("renders the approved DPIP story, team attribution, seven PRs and limitations", async () => {
    expect(await validateCaseStudyContent(dpip.id)).toBe("valid");
    const article = (await getPublicCaseStudy(dpip.id))!;
    expect(article.project).toBe(dpip);
    const html = renderToStaticMarkup(article.content);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html.match(/<h2\b/g)).toHaveLength(9);
    for (const text of [
      "這個功能是我自己提出來的。",
      "DPIP（ExpTechTW 團隊專案）",
      "App Group 共享天氣快照",
      "Platform Channel",
      "未滿 30 分鐘",
      "30 分鐘至未滿 120 分鐘",
      "達 120 分鐘",
      "當部分資料不存在時，也不能為了湊滿畫面而自己補出假的預報。",
      "按下刷新按鈕，不代表 iOS 就一定會立即取得最新資料。",
      "並不是說 Apple 天氣一定比較不準",
      "實際準確度還是需要透過客觀比較才能判斷",
      "但這不代表所有情況都已經完成測試。",
      "DPIP 本身是團隊共同開發的產品",
      "我希望未來還能繼續探索更多 iOS 原生功能",
    ])
      expect(html).toContain(text);
    const links = [
      ...html.matchAll(
        /href="(https:\/\/github.com\/ExpTechTW\/DPIP\/pull\/\d+)"/g,
      ),
    ].map(([, href]) => href);
    expect([...new Set(links)].sort()).toEqual(
      [576, 579, 580, 582, 607, 608, 629]
        .map((id) => `https://github.com/ExpTechTW/DPIP/pull/${id}`)
        .sort(),
    );
    expect(html).toContain('role="region"');
    expect(html).toContain('tabindex="0"');
    expect(html).not.toMatch(
      /<img|<video|<iframe|<svg|CASE_STUDY_|synthetic fixture/,
    );
    const source = await fs.readFile(
      "src/contents/case-studies/dpip.mdx",
      "utf8",
    );
    expect(source).not.toMatch(/^---|!\[|\/Users\/|\/home\//);
    const metadata = await articleMetadata({
      params: Promise.resolve({ slug: dpip.slug }),
    });
    expect(metadata.title).toBe(
      "DPIP｜第一次把 Flutter 跟 SwiftUI 結合，開發 iOS 天氣 Widget",
    );
    expect(metadata.description).toBe(
      `${dpip.summary} 其實一開始，DPIP 團隊並沒有特別規劃要開發 iOS 天氣 Widget。`,
    );
    expect(metadata.description).not.toMatch(
      /專案：|主要技術：|個人參與：|\*\*/,
    );
    expect(metadata.alternates?.canonical).toBe(
      "https://yincheng.app/projects/dpip/case-study",
    );
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      url: "https://yincheng.app/projects/dpip/case-study",
      title: article.title,
      description: article.description,
    });
    expect(metadata.twitter).toMatchObject({
      title: article.title,
      description: article.description,
      images: ["https://yincheng.app/projects/dpip/og"],
    });
  });

  test("renders approved PersonAI team story, personal retest, metadata and references", async () => {
    expect(personai.id).toBe("personai-api");
    expect(personai.slug).toBe("personai-api");
    expect(personai.title).toBe("PersonAI");
    expect(await validateCaseStudyContent(personai.id)).toBe("valid");
    const article = (await getPublicCaseStudyBySlug(personai.slug))!;
    expect(article.project).toBe(personai);
    const html = renderToStaticMarkup(article.content);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html.match(/<h2\b/g)).toHaveLength(10);
    expect(html.match(/<h3\b/g)).toHaveLength(4);
    for (const text of [
      "PersonAI（大學畢業專題團隊作品）",
      "我主要擔任 PM 和組長",
      "PersonAI 仍然是團隊共同參與的畢業專題",
      "MediaPipe 負責的是人體姿態偵測，並不是直接幫我們判斷完成了幾次深蹲。",
      "33 個人體關鍵點",
      "frame_id",
      "One-Euro Filter",
      "FSM",
      "即使只是坐在椅子上活動膝蓋",
      "站姿基準、髖部下降幅度",
      "當時沒有再重現原本的誤計問題",
      "目前還不能說這個問題已經完全解決",
      "不能直接把未知數值當成零",
      "並不代表已經透過研究證明它能提高運動持續率",
      "不能直接把它當成真人運動時的計次準確率",
      "更不能當成醫療或運動安全保證",
    ])
      expect(html).toContain(text);
    for (const [repo, ids] of [
      ["personai-web", [2, 3]],
      ["personai-api", [2, 3, 4]],
    ] as const) {
      expect(html).toContain(`href="https://github.com/YinCheng0106/${repo}"`);
      for (const id of ids)
        expect(html).toContain(
          `href="https://github.com/YinCheng0106/${repo}/pull/${id}"`,
        );
    }
    expect(html).not.toMatch(
      /<img|<video|<iframe|<svg|CASE_STUDY_|synthetic fixture/,
    );
    const source = await fs.readFile(
      "src/contents/case-studies/personai-api.mdx",
      "utf8",
    );
    expect(source).not.toMatch(/^---|!\[|\/Users\/|\/home\//);
    const metadata = await articleMetadata({
      params: Promise.resolve({ slug: personai.slug }),
    });
    expect(metadata.title).toBe(
      "PersonAI｜從人體關鍵點到運動計次，開發 AI 智能健身教練",
    );
    expect(metadata.description).toBe(
      `${personai.summary} 其實當初在決定畢業專題題目的時候，我們也考慮到這幾年 AI 技術的發展趨勢。`,
    );
    expect(metadata.alternates?.canonical).toBe(
      "https://yincheng.app/projects/personai-api/case-study",
    );
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      title: article.title,
      description: article.description,
      url: `https://yincheng.app${article.href}`,
    });
    expect(metadata.twitter).toMatchObject({
      title: article.title,
      description: article.description,
      images: ["https://yincheng.app/projects/personai-api/og"],
    });
    expect(
      renderToStaticMarkup(
        await CaseStudyPage({
          params: Promise.resolve({ slug: personai.slug }),
        }),
      ),
    ).toContain('href="/projects/personai-api"');
  });

  test("each missing or invalid article fails closed without disabling the other two", async () => {
    const originalRead = fs.readFile;
    for (const project of approved) {
      const others = approved.filter((item) => item !== project);
      for (const replacement of [
        null,
        "  \n",
        "# Valid title\n\n<Unclosed",
        "# Labels only\n\n**專案：** DPIP",
      ]) {
        const read = spyOn(fs, "readFile").mockImplementation(((
          ...args: Parameters<typeof fs.readFile>
        ) => {
          if (String(args[0]).endsWith(`/${project.id}.mdx`)) {
            if (replacement === null)
              return Promise.reject(new Error("/Users/private/internal.mdx"));
            const encoding =
              typeof args[1] === "string" ? args[1] : args[1]?.encoding;
            return Promise.resolve(
              encoding ? replacement : Buffer.from(replacement),
            );
          }
          return originalRead(...args);
        }) as typeof fs.readFile);
        try {
          expect(await getPublicCaseStudy(project.id)).toBeNull();
          for (const other of others)
            expect((await getPublicCaseStudy(other.id))?.project).toBe(other);
          expect(
            (await getPublicCaseStudies()).map(({ project }) => project.id),
          ).toEqual(others.map(({ id }) => id));
          const urls = (await sitemap())
            .filter(({ url }) => url.endsWith("/case-study"))
            .map(({ url }) => url);
          expect(urls).toEqual(
            others.map(
              ({ slug }) => `https://yincheng.app/projects/${slug}/case-study`,
            ),
          );
          await expect(
            CaseStudyPage({ params: Promise.resolve({ slug: project.slug }) }),
          ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
          await expect(
            articleMetadata({
              params: Promise.resolve({ slug: project.slug }),
            }),
          ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
        } finally {
          read.mockRestore();
        }
      }
    }
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
        "../dpip",
        "../personai-api",
        "personai-api.mdx",
        "personai",
        "personai-api?preview=true",
        "dpip.mdx",
        "DPIP",
        "dpip?preview=true",
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
    for (const project of approved) {
      const previous = project.publicationStatus;
      const read = spyOn(fs, "readFile");
      try {
        for (const status of ["draft", "private", "unlisted"] as const) {
          read.mockClear();
          project.publicationStatus = status;
          expect(await getPublicCaseStudy(project.id)).toBeNull();
          expect(await getPublicCaseStudyBySlug(project.slug)).toBeNull();
          expect(
            (await getPublicCaseStudies()).map(({ project }) => project.id),
          ).toEqual(
            approved.filter((item) => item !== project).map(({ id }) => id),
          );
          expect(
            (await sitemap()).some(({ url }) =>
              url.endsWith(`/projects/${project.slug}/case-study`),
            ),
          ).toBe(false);
          await expect(
            CaseStudyPage({ params: Promise.resolve({ slug: project.slug }) }),
          ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
          expect(
            read.mock.calls.some(([path]) =>
              String(path).endsWith(`/${project.id}.mdx`),
            ),
          ).toBe(false);
        }
      } finally {
        project.publicationStatus = previous;
        read.mockRestore();
      }
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
    const project = projectV2s.find(({ id }) => id === "personal-website")!;
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
      const dpipPage = await CaseStudyPage({
        params: Promise.resolve({ slug: dpip.slug }),
      });
      expect(renderToStaticMarkup(dpipPage)).toContain(
        "這個功能是我自己提出來的。",
      );
      expect(
        (
          await articleMetadata({
            params: Promise.resolve({ slug: dpip.slug }),
          })
        ).openGraph,
      ).toMatchObject({ type: "article" });
      const personaiPage = await CaseStudyPage({
        params: Promise.resolve({ slug: personai.slug }),
      });
      expect(renderToStaticMarkup(personaiPage)).toContain(
        "當時沒有再重現原本的誤計問題",
      );
      expect(
        (
          await articleMetadata({
            params: Promise.resolve({ slug: personai.slug }),
          })
        ).openGraph,
      ).toMatchObject({ type: "article" });
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      fetch.mockRestore();
    }
  });

  test("publishes only DPIP, PersonAI and QuotaMew and preserves project metadata", async () => {
    const urls = (await sitemap()).map(({ url }) => url);
    expect(urls.filter((url) => /\/projects\/[^/]+$/.test(url))).toHaveLength(
      6,
    );
    expect(urls.filter((url) => url.includes("/case-study"))).toEqual([
      "https://yincheng.app/projects/dpip/case-study",
      "https://yincheng.app/projects/personai-api/case-study",
      "https://yincheng.app/projects/quotamew/case-study",
    ]);
    expect(
      (await getPublicCaseStudies()).map(({ project }) => project.id),
    ).toEqual(["dpip", "personai-api", "quotamew"]);
    for (const project of projectV2s) {
      if (!approved.includes(project)) {
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
