import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

import { projectV2s } from "@/lib/project-v2-data";
import type { ProjectV2 } from "@/lib/project-v2";

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
  quotamew: {
    approval: "draft",
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
 * Future public-page entry point. Gate BEFORE reading or compiling content,
 * including in development. No preview flag or approval override is exposed.
 * Metadata comes exclusively from the original Project v2 record.
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
  try {
    return {
      project: match.project,
      content: await compileLocalContent(source),
    };
  } catch {
    return null;
  }
}
