import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Icon } from "@iconify-icon/react";

import { notoSerifTC } from "@/app/fonts";
import { getPostBySlug, getAllPosts } from "@/lib/posts";

import { MDXComponents } from "@/components/mdx/mdx-components";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return notFound();
  }

  const remarkPlugins = [remarkGfm, remarkToc];

  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12 text-center">
        <h1
          className={`mb-4 text-2xl font-bold md:text-5xl ${notoSerifTC.className}`}
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
          </div>
          <div className="flex justify-center gap-2">
            {/* 預留Tags 可以連結到 TagsPage */}
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="items-center transition-opacity hover:opacity-80"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </header>
      <section
        className={`prose md:prose-lg prose-pre:bg-accent prose-table:table-auto dark:prose-invert max-w-none`}
      >
        <MDXRemote
          source={post.content}
          components={MDXComponents({})}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            },
          }}
        />
      </section>
    </article>
  );
}
