import type { MetadataRoute } from "next";

import {
  getAllCategories,
  getAllPostsMeta,
  getAllSeries,
  getAllTags,
} from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/blog",
    "/blog/category",
    "/blog/tag",
    "/projects",
    "/about",
    "/stars",
    "/link",
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
  }));

  const postRoutes: MetadataRoute.Sitemap = getAllPostsMeta().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
  }));

  const categoryRoutes: MetadataRoute.Sitemap = getAllCategories().map(
    (category) => ({
      url: `${base}/blog/category/${encodeURIComponent(category.name)}`,
      lastModified: now,
    }),
  );

  const tagRoutes: MetadataRoute.Sitemap = getAllTags().map((tag) => ({
    url: `${base}/blog/tag/${encodeURIComponent(tag.name)}`,
    lastModified: now,
  }));

  const seriesRoutes: MetadataRoute.Sitemap = getAllSeries().map((series) => ({
    url: `${base}/blog/series/${encodeURIComponent(series.name)}`,
    lastModified: now,
  }));

  return [
    ...staticRoutes,
    ...postRoutes,
    ...categoryRoutes,
    ...tagRoutes,
    ...seriesRoutes,
  ];
}
