import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Icon } from "@iconify-icon/react";

import { notoSerifTC } from "@/app/fonts";
import {
  extractHeadings,
  getAdjacentPosts,
  getAllPostsMeta,
  getPostBySlug,
  getPostsBySeries,
  getRelatedPosts,
} from "@/lib/posts";
import { siteConfig } from "@/lib/site";

import { MDXComponents } from "@/components/mdx/mdx-components";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReadingProgress } from "@/components/app/readingProgress";
import { TableOfContents } from "@/components/app/tableOfContents";
import { PostNav } from "@/components/app/postNav";
import { BlobCard } from "@/components/app/blogCard";
import { ViewCounter } from "@/components/app/viewCounter";
import { Comments } from "@/components/app/comments";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllPostsMeta().map((post) => ({ slug: post.slug }));
}

// 只產生 generateStaticParams 列出的文章；其餘 slug 直接 404
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章不存在",
      description: "找不到您所尋找的文章。",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteConfig.url}/blog/${slug}`,
      type: "article",
      authors: [siteConfig.author],
      tags: post.tags,
      images: [
        {
          url: `${siteConfig.url}/blog/${slug}/og`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return notFound();
  }

  const headings = extractHeadings(post.content);
  const { newer, older } = getAdjacentPosts(slug);
  const related = getRelatedPosts(slug);
  const seriesPosts = post.series ? getPostsBySeries(post.series) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.url,
    },
    image: `${siteConfig.url}/blog/${slug}/og`,
    url: `${siteConfig.url}/blog/${slug}`,
    keywords: post.tags.join(", "),
    articleSection: post.category,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${slug}`,
    },
  };

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        <div className="flex justify-center gap-12">
          <article className="w-full max-w-4xl min-w-0">
            <header className="mb-12 text-center">
              <h1
                className={`mb-8 text-2xl font-bold md:text-5xl ${notoSerifTC.className}`}
              >
                {post.title}
              </h1>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:gap-6">
                <div className="text-accent-foreground/50 flex items-center justify-center gap-4 text-sm">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <Icon icon="mdi:calendar" />
                        {post.formatDate}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="font-bold">發布日期</span>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <Icon icon="mdi:clock-time-four-outline" />
                        {post.readingTime}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="font-bold">閱讀時間</span>
                    </TooltipContent>
                  </Tooltip>
                  <ViewCounter slug={slug} />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge
                    asChild
                    variant="default"
                    className="items-center transition-opacity hover:opacity-80"
                  >
                    <Link
                      href={`/blog/category/${encodeURIComponent(post.category)}`}
                    >
                      {post.category}
                    </Link>
                  </Badge>
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      asChild
                      variant="secondary"
                      className="items-center transition-opacity hover:opacity-80"
                    >
                      <Link href={`/blog/tag/${encodeURIComponent(tag)}`}>
                        {tag}
                      </Link>
                    </Badge>
                  ))}
                </div>
              </div>
            </header>

            {post.cover && (
              <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-xl border">
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </div>
            )}

            {post.series && seriesPosts.length > 1 && (
              <Card className="mb-12 gap-3 px-6">
                <Link
                  href={`/blog/series/${encodeURIComponent(post.series)}`}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
                >
                  <Icon icon="mdi:bookmark-multiple-outline" />
                  系列文章 · {post.series}
                </Link>
                <ol className="space-y-1.5 text-sm">
                  {seriesPosts.map((seriesPost, index) => (
                    <li key={seriesPost.slug}>
                      {seriesPost.slug === slug ? (
                        <span className="text-foreground font-medium">
                          {index + 1}. {seriesPost.title}（本篇）
                        </span>
                      ) : (
                        <Link
                          href={`/blog/${seriesPost.slug}`}
                          className="link"
                        >
                          {index + 1}. {seriesPost.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            <section
              className={`prose md:prose-lg prose-pre:bg-accent prose-table:table-auto prose-code:before:content-none prose-code:after:content-none dark:prose-invert max-w-dvw`}
            >
              <MDXRemote
                source={post.content}
                components={MDXComponents({})}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeSlug],
                  },
                }}
              />
            </section>

            <PostNav newer={newer} older={older} />

            {related.length > 0 && (
              <section className="mt-16">
                <h2
                  className={`mb-6 text-2xl font-bold ${notoSerifTC.className}`}
                >
                  相關文章
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {related.map((relatedPost) => (
                    <BlobCard key={relatedPost.slug} post={relatedPost} />
                  ))}
                </div>
              </section>
            )}

            <Comments />
          </article>

          {headings.length > 0 && (
            <aside className="hidden w-56 shrink-0 xl:block">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
