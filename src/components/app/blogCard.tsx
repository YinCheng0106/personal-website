"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Icon } from "@iconify-icon/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/lib/posts";

interface Props {
  post: PostMeta;
}

export function BlobCard({ post }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card className="group relative flex h-full flex-1 flex-col overflow-hidden transition-shadow hover:shadow-lg">
        {/* 覆蓋整張卡片的連結，讓卡片任意處可點進文章；tag 連結以 z-10 浮於其上 */}
        <Link
          href={`/blog/${post.slug}`}
          aria-label={post.title}
          className="absolute inset-0 z-0"
        />
        {post.cover && (
          <div className="relative -mt-6 mb-2 aspect-[16/9] w-full">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
        <CardHeader className="flex-1">
          <CardTitle className="text-lg font-semibold">{post.title}</CardTitle>
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
            <div className="relative z-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  asChild
                  variant="secondary"
                  className="items-center transition-opacity hover:opacity-80"
                >
                  <Link href={`/blog/tag/${encodeURIComponent(tag)}`}>
                    {tag}
                  </Link>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
