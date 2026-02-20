import { Metadata } from "next";

import { getAllPosts } from "@/lib/posts";
import { SectionTitle } from "@/components/app/sectionTitle";
import { BlobCard } from "@/components/app/blogCard";

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
  }
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="container mx-auto px-6 py-16">
      <SectionTitle title="部落格" />

      {posts.length === 0 ? (
        <p className="text-muted-foreground justify-center text-center">
          文章努力產出中，敬請期待！
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <BlobCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
