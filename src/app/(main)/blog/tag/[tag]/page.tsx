import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllTags, getPostsByTag } from "@/lib/posts";
import { SectionTitle } from "@/components/app/sectionTitle";
import { BlobCard } from "@/components/app/blogCard";

type Props = {
  params: Promise<{ tag: string }>;
};

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.name }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const name = decodeURIComponent(tag);

  return {
    title: `標籤：${name}`,
    description: `所有標記「${name}」的文章`,
    openGraph: {
      title: `標籤：${name}`,
      description: `所有標記「${name}」的文章`,
      url: `https://yincheng.app/blog/tag/${tag}`,
      siteName: "YinCheng 部落格",
      images: [
        {
          url: "https://yincheng.app/blog/og",
          width: 1200,
          height: 630,
          alt: `標籤：${name}`,
        },
      ],
      locale: "zh_TW",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `標籤：${name}`,
      description: `所有標記「${name}」的文章`,
      images: ["https://yincheng.app/blog/og"],
    },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  const posts = getPostsByTag(name);

  if (posts.length === 0) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle
        title={name}
        subtitle={`標籤 · 共 ${posts.length} 篇文章`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <BlobCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
