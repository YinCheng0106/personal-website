"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Icon } from "@iconify-icon/react";

import { BlobCard } from "@/components/app/blogCard";
import { Button } from "@/components/ui/button";
import type { PostMeta } from "@/lib/posts";

const PAGE_SIZE = 6;

interface Props {
  posts: PostMeta[];
}

export function BlogList({ posts }: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ["title", "description", "tags", "category"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [posts],
  );

  const results = useMemo(() => {
    const keyword = query.trim();
    return keyword ? fuse.search(keyword).map((result) => result.item) : posts;
  }, [query, fuse, posts]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = results.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div>
      <div className="relative mx-auto mb-8 max-w-md">
        <Icon
          icon="mdi:magnify"
          className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder="搜尋文章…"
          aria-label="搜尋文章"
          className="border-border bg-background focus-visible:ring-ring/50 focus-visible:border-ring w-full rounded-lg border py-2 pr-4 pl-10 text-sm outline-none focus-visible:ring-[3px]"
        />
      </div>

      {results.length === 0 ? (
        <p className="text-muted-foreground text-center">
          找不到符合「{query}」的文章。
        </p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {pageItems.map((post) => (
              <BlobCard key={post.slug} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <Icon icon="mdi:chevron-left" />
                上一頁
              </Button>
              <span className="text-muted-foreground text-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                下一頁
                <Icon icon="mdi:chevron-right" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
