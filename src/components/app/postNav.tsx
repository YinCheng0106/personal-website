import Link from "next/link";
import { Icon } from "@iconify-icon/react";

import { Card } from "@/components/ui/card";
import type { PostMeta } from "@/lib/posts";

interface Props {
  newer: PostMeta | null;
  older: PostMeta | null;
}

export function PostNav({ newer, older }: Props) {
  if (!newer && !older) return null;

  return (
    <nav className="mt-16 grid gap-4 sm:grid-cols-2">
      {newer ? (
        <Link href={`/blog/${newer.slug}`} className="group">
          <Card className="h-full justify-center gap-2 px-6 transition-shadow hover:shadow-lg">
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <Icon icon="mdi:arrow-left" />
              較新文章
            </div>
            <div className="font-semibold">{newer.title}</div>
          </Card>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {older ? (
        <Link href={`/blog/${older.slug}`} className="group">
          <Card className="h-full justify-center gap-2 px-6 text-right transition-shadow hover:shadow-lg">
            <div className="text-muted-foreground flex items-center justify-end gap-1 text-sm">
              較舊文章
              <Icon icon="mdi:arrow-right" />
            </div>
            <div className="font-semibold">{older.title}</div>
          </Card>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
}
