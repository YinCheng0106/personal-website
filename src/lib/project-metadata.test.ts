import { describe, expect, test } from "bun:test";

import { generateMetadata } from "@/app/(main)/projects/[slug]/page";
import { projectV2s } from "@/lib/project-v2-data";

const metadataFor = (slug: string) =>
  generateMetadata({ params: Promise.resolve({ slug }) });

describe("project detail metadata", () => {
  test("uses the curated summary for SEO, Open Graph, and Twitter on all seven published routes", async () => {
    const published = projectV2s.filter(
      (project) => project.publicationStatus === "published",
    );
    expect(published).toHaveLength(7);

    for (const project of published) {
      const metadata = await metadataFor(project.slug);
      expect(metadata.title).toBe(project.title);
      expect(metadata.description).toBe(project.summary);
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

    const dpip = await metadataFor("dpip");
    expect(dpip.description).toContain("臺灣防災資訊 App");
    expect(dpip.description).toContain("iOS 天氣小工具");

    const quotaMew = await metadataFor("quotamew");
    expect(quotaMew.description).toContain("原生 macOS 選單列 App");
    expect(quotaMew.description).toContain("Claude Code 整合仍屬實驗性、未驗證");
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
      const metadata = await metadataFor("personai-api");
      expect(metadata.description).toBe(
        projectV2s.find((project) => project.slug === "personai-api")?.summary,
      );
      expect(calls).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("keeps unknown routes out of search results", async () => {
    const metadata = await metadataFor("missing-project");
    expect(metadata.title).toBe("專案不存在");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
