import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicCaseStudyBySlug } from "@/lib/case-studies";
import { siteConfig } from "@/lib/site";

// Read the packaged local article on the server, including in production.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getPublicCaseStudyBySlug((await params).slug);
  if (!article) notFound();

  const url = `${siteConfig.url}${article.href}`;
  // Reuse the existing product OG image without introducing article media.
  const image = `${siteConfig.url}/projects/${article.project.slug}/og`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      locale: siteConfig.locale,
      images: [
        { url: image, width: 1200, height: 630, alt: article.project.title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [image],
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const article = await getPublicCaseStudyBySlug((await params).slug);
  if (!article) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl min-w-0 py-4 sm:py-8">
      <Link href={`/projects/${article.project.slug}`} className="link">
        ← 返回 {article.project.title}
      </Link>
      <article
        aria-label={article.title}
        className="prose dark:prose-invert prose-h1:text-3xl prose-h1:leading-snug prose-h2:mt-10 prose-h2:text-2xl prose-p:leading-8 sm:prose-h1:text-4xl mt-8 max-w-none break-words"
      >
        {article.content}
      </article>
    </div>
  );
}
