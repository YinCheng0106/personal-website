import Link from "next/link";
import { Icon } from "@iconify-icon/react";

import { getAllPosts } from "@/lib/posts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionTitle } from "@/components/app/sectionTitle";
import { Badge } from "@/components/ui/badge";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="container mx-auto px-6 py-16">
      <SectionTitle title="部落格" />

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex h-full flex-col"
          >
            <Card className="flex flex-1 flex-col transition-shadow hover:shadow-lg">
              <CardHeader className="flex-1">
                <CardTitle className="text-lg font-semibold">
                  {post.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-auto flex flex-col gap-4 text-sm">
                  <div className="text-accent-foreground/50 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Icon icon="mdi:calendar" />
                      {post.formatDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon icon="mdi:clock-time-four-outline" />
                      {post.readingTime}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
