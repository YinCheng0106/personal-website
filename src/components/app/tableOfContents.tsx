"use client";

import { useEffect, useState } from "react";

import type { Heading } from "@/lib/posts";
import { cn } from "@/lib/utils";

interface Props {
  headings: Heading[];
}

export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      // 以 header 高度為上邊界，並只在標題進入畫面上半部時才高亮
      { rootMargin: "-96px 0px -70% 0px" },
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.slug);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="目錄" className="text-sm">
      <p className="text-foreground mb-3 font-bold">目錄</p>
      <ul className="space-y-2.5">
        {headings.map((heading) => (
          <li
            key={heading.slug}
            style={{ paddingLeft: (heading.depth - 2) * 14 }}
          >
            <a
              href={`#${heading.slug}`}
              className={cn(
                "block leading-snug transition-colors",
                activeId === heading.slug
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
