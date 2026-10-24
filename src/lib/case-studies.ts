import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

import { projectV2s } from "@/lib/project-v2-data";
import type { ProjectV2 } from "@/lib/project-v2";
import { getProjectBySlug } from "@/lib/projects";
import { caseStudyComponents } from "@/components/mdx/case-study-components";

type ArticleApproval = "draft" | "approved";
type Entry = {
  approval: ArticleApproval;
  read: () => Promise<string>;
};

/**
 * Code-reviewed allowlist, keyed by ProjectV2.id, never a slug, URL or filename.
 * Readers contain only literal repository-local paths. Do not derive a reader
 * from caseStudy.href, request input, GitHub content or directory enumeration.
 * Approval is independent of product publication and requires editorial review.
 */
const registry: Readonly<Record<string, Entry>> = {
  dpip: {
    approval: "approved",
    read: () =>
      readFile(
        join(process.cwd(), "src/contents/case-studies/dpip.mdx"),
        "utf8",
      ),
  },
  "personai-api": {
    approval: "approved",
    read: () =>
      readFile(
        join(process.cwd(), "src/contents/case-studies/personai-api.mdx"),
        "utf8",
      ),
  },
  quotamew: {
    approval: "approved",
    read: () =>
      readFile(
        join(process.cwd(), "src/contents/case-studies/quotamew.mdx"),
        "utf8",
      ),
  },
};

function lookup(projectId: unknown) {
  if (typeof projectId !== "string" || !Object.hasOwn(registry, projectId)) {
    return null;
  }
  const project = projectV2s.find(({ id }) => id === projectId);
  return project ? { project, entry: registry[projectId] } : null;
}

/** Case Studies require a listed product AND explicit article approval. */
export function isCaseStudyPublicationEligible(
  project: ProjectV2,
  approval: ArticleApproval,
): boolean {
  return project.publicationStatus === "published" && approval === "approved";
}

async function readSource(entry: Entry): Promise<string | null> {
  try {
    const source = await entry.read();
    return source.trim() ? source : null;
  } catch {
    // Missing/unreadable content must not disclose filesystem or error details.
    return null;
  }
}

async function compileLocalContent(source: string) {
  // Private sink: the only caller-supplied value in this module is a project ID.
  // MDX is executable trusted code, not a sanitizer for external Markdown.
  const { content } = await compileMDX({
    source,
    components: caseStudyComponents,
    options: {
      parseFrontmatter: false,
      blockJS: true,
      mdxOptions: {
        useDynamicImport: false,
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
  });
  return content;
}

/** Server-side authoring diagnostic; never returns article text or metadata. */
export async function getCaseStudyAvailability(projectId: unknown) {
  const match = lookup(projectId);
  if (!match) return { hasContent: false, publicationEligible: false };
  return {
    hasContent: (await readSource(match.entry)) !== null,
    publicationEligible: isCaseStudyPublicationEligible(
      match.project,
      match.entry.approval,
    ),
  };
}

/** Internal validation may compile a draft, but never returns its render tree. */
export async function validateCaseStudyContent(
  projectId: unknown,
): Promise<"missing" | "invalid" | "valid"> {
  const match = lookup(projectId);
  if (!match) return "missing";
  const source = await readSource(match.entry);
  if (source === null) return "missing";
  try {
    await compileLocalContent(source);
    return "valid";
  } catch {
    return "invalid";
  }
}

/**
 * Public-page entry point. Gate BEFORE reading or compiling content,
 * including in development. No preview flag or approval override is exposed.
 * Product identity stays in Project v2; the article heading supplies its title.
 */
export async function getPublicCaseStudy(projectId: unknown) {
  const match = lookup(projectId);
  if (
    !match ||
    !isCaseStudyPublicationEligible(match.project, match.entry.approval)
  ) {
    return null;
  }
  const source = await readSource(match.entry);
  if (source === null) return null;
  // Article metadata is derived from this same approved source, not frontmatter
  // or a second product record. Require one plain-text title and opening prose.
  const title = source.match(/^# ([^\n]+)\n/)?.[1].trim();
  const opening = source
    .split(/\n\s*\n/)
    // Skip Markdown headings, bold label blocks, bullets and tables. In particular,
    // the approved DPIP article opens with bold project/contribution labels.
    .find((paragraph) => /^[\p{L}\p{N}]/u.test(paragraph.trim()))
    ?.trim();
  if (!title || !opening) return null;
  try {
    return {
      project: match.project,
      title,
      description: `${match.project.summary} ${opening}`,
      href: `/projects/${match.project.slug}/case-study`,
      content: await compileLocalContent(source),
    };
  } catch {
    return null;
  }
}

/** Resolve route identity through Project v2, then use its stable content ID. */
export async function getPublicCaseStudyBySlug(slug: string) {
  const project = getProjectBySlug(slug);
  return project ? getPublicCaseStudy(project.id) : null;
}

/** Discovery uses the same approval, visibility and readable-content gate. */
export async function getPublicCaseStudies() {
  const articles = await Promise.all(
    projectV2s.map((project) => getPublicCaseStudy(project.id)),
  );
  return articles.filter((article) => article !== null);
}
