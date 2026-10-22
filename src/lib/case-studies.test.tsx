import { describe, expect, mock, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";
import { compileMDX } from "next-mdx-remote/rsc";

import sitemap from "@/app/sitemap";
import { generateMetadata } from "@/app/(main)/projects/[slug]/page";
import { projectV2s } from "@/lib/project-v2-data";
import type { ProjectV2 } from "@/lib/project-v2";
import { getProjectBySlug, getPublicProjects } from "@/lib/projects";

// Next enforces this poison import at its Client Component boundary. Bun has no
// Next module graph; disable only the marker, retaining the real reader/compiler.
mock.module("server-only", () => ({}));
const {
  getCaseStudyAvailability,
  getPublicCaseStudy,
  isCaseStudyPublicationEligible,
  validateCaseStudyContent,
} = await import("@/lib/case-studies");

const pilot = projectV2s.find(({ id }) => id === "quotamew")!;
const marker = "CASE_STUDY_QUOTAMEW_INTERNAL_FIXTURE";

describe("trusted Case Study infrastructure", () => {
  test("looks up QuotaMew by the canonical Project v2 ID", async () => {
    expect(pilot.id).toBe("quotamew");
    expect(await getCaseStudyAvailability(pilot.id)).toEqual({
      hasContent: true,
      publicationEligible: false,
    });
    // PersonAI's product title differs from its stable ID; neither is inferred.
    expect(await validateCaseStudyContent("PersonAI")).toBe("missing");
    expect(await validateCaseStudyContent("personai-api")).toBe("missing");
  });

  test("compiles the allowlisted local pilot using the real MDX compiler", async () => {
    expect(await validateCaseStudyContent(pilot.id)).toBe("valid");
    const source = await fs.readFile(
      "src/contents/case-studies/quotamew.mdx",
      "utf8",
    );
    const { content } = await compileMDX({ source });
    const html = renderToStaticMarkup(content);
    expect(html).toContain(marker);
    expect(html).toContain('data-case-study-fixture="trusted-local">Local MDX');
    expect(source).not.toMatch(/^---/);
    expect(source).not.toMatch(/\/Users\/|\/home\/|account|quota\s*[:=]\s*\d/i);
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

  test("blocks the unapproved pilot before any file read, even in development", async () => {
    const read = spyOn(fs, "readFile");
    try {
      expect(await getPublicCaseStudy(pilot.id)).toBeNull();
      expect(read).not.toHaveBeenCalled();
    } finally {
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
          publicationEligible: false,
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
    const read = spyOn(fs, "readFile").mockResolvedValue("<Unclosed");
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
      expect(await getPublicCaseStudy(pilot.id)).toBeNull();
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
        publicationEligible: false,
      });
      expect(await validateCaseStudyContent(pilot.id)).toBe("valid");
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      fetch.mockRestore();
    }
  });

  test("publishes no article metadata or sitemap entries for any project", async () => {
    const urls = sitemap().map(({ url }) => url);
    expect(urls.filter((url) => /\/projects\/[^/]+$/.test(url))).toHaveLength(
      6,
    );
    expect(urls.some((url) => /case-stud/i.test(url))).toBe(false);
    for (const project of projectV2s) {
      expect(await getPublicCaseStudy(project.id)).toBeNull();
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: project.slug }),
      });
      expect(metadata.description).toBe(project.summary);
      const serialized = JSON.stringify(metadata);
      expect(serialized).not.toContain(marker);
      expect(serialized).not.toContain("trusted-local");
      expect(serialized).not.toContain("case-studies");
      expect(serialized).not.toContain("/Users/");
    }
  });
});
