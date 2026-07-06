import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllSeries, getPostsBySeries } from "@/lib/posts";
import { SectionTitle } from "@/components/app/sectionTitle";
import { BlobCard } from "@/components/app/blogCard";

type Props = {
  params: Promise<{ series: string }>;
};

export function generateStaticParams() {
  return getAllSeries().map((series) => ({ series: series.name }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series } = await params;
  const name = decodeURIComponent(series);

  return {
    title: `系列：${name}`,
    description: `「${name}」系列的所有文章`,
    openGraph: {
      title: `系列：${name}`,
      description: `「${name}」系列的所有文章`,
      url: `https://yincheng.app/blog/series/${series}`,
      siteName: "YinCheng 部落格",
      images: [
        {
          url: "https://yincheng.app/blog/og",
          width: 1200,
          height: 630,
          alt: `系列：${name}`,
        },
      ],
      locale: "zh_TW",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `系列：${name}`,
      description: `「${name}」系列的所有文章`,
      images: ["https://yincheng.app/blog/og"],
    },
  };
}

export default async function SeriesPage({ params }: Props) {
  const { series } = await params;
  const name = decodeURIComponent(series);
  const posts = getPostsBySeries(name);

  if (posts.length === 0) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle
        title={name}
        subtitle={`系列 · 共 ${posts.length} 篇文章`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <BlobCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
