import { Feed } from "feed";

import { getAllPostsMeta } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

// 建置期產生靜態 feed
export const dynamic = "force-static";

export function GET() {
  const feed = new Feed({
    title: siteConfig.blog.title,
    description: siteConfig.blog.description,
    id: `${siteConfig.url}/blog`,
    link: `${siteConfig.url}/blog`,
    language: "zh-TW",
    copyright: `© ${siteConfig.author}`,
    feedLinks: {
      rss: `${siteConfig.url}/rss.xml`,
    },
    author: {
      name: siteConfig.author,
      link: siteConfig.url,
    },
  });

  for (const post of getAllPostsMeta()) {
    const url = `${siteConfig.url}/blog/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      date: new Date(post.date),
      category: [
        { name: post.category },
        ...post.tags.map((tag) => ({ name: tag })),
      ],
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
