"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";

interface Props {
  slug: string;
}

export function ViewCounter({ slug }: Props) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const sessionKey = `viewed:${slug}`;
    // 同一個瀏覽階段只計數一次，其餘只讀取
    const method = sessionStorage.getItem(sessionKey) ? "GET" : "POST";

    fetch(`/api/views/${encodeURIComponent(slug)}`, { method })
      .then((res) => res.json())
      .then((data: { views: number | null }) => {
        if (!active) return;
        setViews(data.views);
        if (method === "POST" && data.views !== null) {
          sessionStorage.setItem(sessionKey, "1");
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [slug]);

  // 未設定後端（views 為 null）時不顯示，避免破壞版面
  if (views === null) return null;

  return (
    <div className="flex items-center gap-1">
      <Icon icon="mdi:eye-outline" />
      {views} 次瀏覽
    </div>
  );
}
