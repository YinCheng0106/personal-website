import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllCategories, getPostsByCategory } from "@/lib/posts";
import { SectionTitle } from "@/components/app/sectionTitle";
import { BlobCard } from "@/components/app/blogCard";

type Props = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ category: category.name }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const name = decodeURIComponent(category);

  return {
    title: `分類：${name}`,
    description: `所有「${name}」分類的文章`,
    openGraph: {
      title: `分類：${name}`,
      description: `所有「${name}」分類的文章`,
      url: `https://yincheng.app/blog/category/${category}`,
      siteName: "YinCheng 部落格",
      images: [
        {
          url: "https://yincheng.app/blog/og",
          width: 1200,
          height: 630,
          alt: `分類：${name}`,
        },
      ],
      locale: "zh_TW",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `分類：${name}`,
      description: `所有「${name}」分類的文章`,
      images: ["https://yincheng.app/blog/og"],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const name = decodeURIComponent(category);
  const posts = getPostsByCategory(name);

  if (posts.length === 0) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle
        title={name}
        subtitle={`分類 · 共 ${posts.length} 篇文章`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <BlobCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
