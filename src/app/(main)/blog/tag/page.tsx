import { Metadata } from "next";
import Link from "next/link";

import { getAllTags } from "@/lib/posts";
import { SectionTitle } from "@/components/app/sectionTitle";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "標籤",
  description: "依標籤瀏覽我的文章",
  openGraph: {
    title: "標籤",
    description: "依標籤瀏覽我的文章",
    url: "https://yincheng.app/blog/tag",
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
    title: "標籤",
    description: "依標籤瀏覽我的文章",
    images: ["https://yincheng.app/blog/og"],
  },
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle title="標籤" subtitle={`共 ${tags.length} 個標籤`} />

      {tags.length === 0 ? (
        <p className="text-muted-foreground justify-center text-center">
          目前沒有任何標籤。
        </p>
      ) : (
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.name}
              asChild
              variant="secondary"
              className="items-center transition-opacity hover:opacity-80"
            >
              <Link href={`/blog/tag/${encodeURIComponent(tag.name)}`}>
                {tag.name}
                <span className="text-muted-foreground ml-1">{tag.count}</span>
              </Link>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
