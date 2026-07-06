import { Metadata } from "next";
import Link from "next/link";

import { getAllCategories } from "@/lib/posts";
import { SectionTitle } from "@/components/app/sectionTitle";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "分類",
  description: "依分類瀏覽我的文章",
  openGraph: {
    title: "分類",
    description: "依分類瀏覽我的文章",
    url: "https://yincheng.app/blog/category",
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
    title: "分類",
    description: "依分類瀏覽我的文章",
    images: ["https://yincheng.app/blog/og"],
  },
};

export default function CategoriesPage() {
  const categories = getAllCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle title="分類" subtitle={`共 ${categories.length} 個分類`} />

      {categories.length === 0 ? (
        <p className="text-muted-foreground justify-center text-center">
          目前沒有任何分類。
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/blog/category/${encodeURIComponent(category.name)}`}
              className="group"
            >
              <Card className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {category.name}
                  </CardTitle>
                  <CardDescription>{category.count} 篇文章</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
