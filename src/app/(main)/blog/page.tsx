import { Metadata } from "next";
import Link from "next/link";

import { getAllPostsMeta } from "@/lib/posts";
import { SectionTitle } from "@/components/app/sectionTitle";
import { BlogList } from "@/components/app/blogList";

export const metadata: Metadata = {
  title: "部落格",
  description: "閱讀我最新的文章與分享",
  openGraph: {
    title: "部落格",
    description: "閱讀我最新的文章與分享",
    url: "https://yincheng.app/blog",
    siteName: "YinCheng 部落格",
    images: [
      {
        url: "https://yincheng.app/blog/og",
        width: 1200,
        height: 630,
        alt: "YinCheng 部落格",
      },
    ],
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "部落格",
    description: "閱讀我最新的文章與分享",
    images: ["https://yincheng.app/blog/og"],
  },
};

export default function BlogPage() {
  const posts = getAllPostsMeta();

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle title="部落格" subtitle="文章都在這" />

      <div className="mb-8 flex justify-center gap-4 text-sm">
        <Link href="/blog/category" className="link font-bold">
          分類
        </Link>
        <Link href="/blog/tag" className="link font-bold">
          標籤
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground justify-center text-center">
          文章努力產出中，敬請期待！
        </p>
      ) : (
        <BlogList posts={posts} />
      )}
    </div>
  );
}
