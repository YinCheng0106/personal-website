import { describe, expect, mock, test } from "bun:test";

import { projectV2s } from "@/lib/project-v2-data";

mock.module("server-only", () => ({}));

const { default: ProjectPage, generateMetadata } = await import(
  "@/app/(main)/projects/[slug]/page"
);
const { default: sitemap } = await import("@/app/sitemap");

const metadataFor = (slug: string) =>
  generateMetadata({ params: Promise.resolve({ slug }) });

describe("project detail metadata", () => {
  test("uses the curated summary and canonical URL on all six published routes", async () => {
    const published = projectV2s.filter(
      (project) => project.publicationStatus === "published",
    );
    expect(published).toHaveLength(6);

    for (const project of published) {
      const metadata = await metadataFor(project.slug);
      expect(metadata.title).toBe(project.title);
      expect(metadata.description).toBe(project.summary);
      expect(metadata.alternates?.canonical).toBe(
        `https://yincheng.app/projects/${project.slug}`,
      );
      expect(metadata.openGraph?.description).toBe(project.summary);
      expect(metadata.twitter?.description).toBe(project.summary);
      expect(metadata.openGraph?.url).toBe(
        `https://yincheng.app/projects/${project.slug}`,
      );
      expect(metadata.openGraph?.images).toEqual([
        {
          url: `https://yincheng.app/projects/${project.slug}/og`,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ]);
      expect(metadata.twitter?.images).toEqual([
        `https://yincheng.app/projects/${project.slug}/og`,
      ]);
      expect(metadata.robots).toBeUndefined();
    }
  });

  test("describes the complete PersonAI and YINLA products and approved DPIP and QuotaMew scope", async () => {
    const personAI = await metadataFor("personai-api");
    expect(personAI.description).toContain("網頁前端與 FastAPI 後端");
    expect(personAI.description).toContain("運動紀錄");

    const yinla = await metadataFor("yinla-bot");
    expect(yinla.description).toContain("Bot");
    expect(yinla.description).toContain("獨立產品網站");
    expect(yinla.alternates?.canonical).toBe(
      "https://yincheng.app/projects/yinla-bot",
    );

    const dpip = await metadataFor("dpip");
    expect(dpip.description).toContain("臺灣防災資訊 App");
    expect(dpip.description).toContain("iOS 天氣小工具");

    const quotaMew = await metadataFor("quotamew");
    expect(quotaMew.description).toContain("原生 macOS 選單列 App");
    expect(quotaMew.description).toContain(
      "Claude Code 整合仍屬實驗性、未驗證",
    );
  });

  test("does not call GitHub when local metadata is available", async () => {
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = Object.assign(
      async () => {
        calls += 1;
        throw new Error("GitHub API unavailable");
      },
      { preconnect: originalFetch.preconnect },
    );

    try {
      for (const slug of ["personai-api", "yinla-bot"]) {
        const metadata = await metadataFor(slug);
        expect(metadata.description).toBe(
          projectV2s.find((project) => project.slug === slug)?.summary,
        );
      }
      expect(calls).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("renders the canonical YINLA route when GitHub is unavailable", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = Object.assign(
      async () => new Response(null, { status: 503 }),
      { preconnect: originalFetch.preconnect },
    );

    try {
      const page = await ProjectPage({
        params: Promise.resolve({ slug: "yinla-bot" }),
      });
      expect(page.type).toBe("div");
      expect(page.props.className).toContain("container");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("keeps unknown routes out of search results", async () => {
    const metadata = await metadataFor("missing-project");
    expect(metadata.title).toBe("專案不存在");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  test("lists canonical YINLA exactly once and omits its old website URL", async () => {
    const urls = (await sitemap()).map(({ url }) => url);
    expect(
      urls.filter((url) => url === "https://yincheng.app/projects/yinla-bot"),
    ).toHaveLength(1);
    expect(urls).not.toContain(
      "https://yincheng.app/projects/yinla-bot-website",
    );
  });
});
