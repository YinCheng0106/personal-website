import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { format } from "date-fns";
import { z } from "zod";
import GithubSlugger from "github-slugger";

const postDirectory = path.join(process.cwd(), "src/contents/posts");

const FrontmatterSchema = z.object({
  title: z.string(),
  date: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  cover: z.string().optional(),
  series: z.string().optional(),
  updated: z.string().optional(),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;

export type PostMeta = Frontmatter & {
  slug: string;
  readingTime: string;
  formatDate: string;
};

export type Post = PostMeta & {
  content: string;
};

function parseFile(fileName: string): Post {
  const slug = fileName.replace(/\.mdx$/, "");
  const fullPath = path.join(postDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const parsed = FrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map(
        (issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
      )
      .join("\n");
    throw new Error(`文章 frontmatter 格式錯誤：${fileName}\n${issues}`);
  }

  const front = parsed.data;

  return {
    ...front,
    slug,
    readingTime: readingTime(fileContents).minutes.toFixed(0) + " 分鐘",
    formatDate: format(new Date(front.date), "yyyy-MM-dd"),
    content,
  };
}

// 草稿只在開發環境顯示，正式環境一律隱藏
function isVisible(post: Pick<Post, "draft">): boolean {
  return process.env.NODE_ENV !== "production" || !post.draft;
}

function stripContent(post: Post): PostMeta {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content, ...meta } = post;
  return meta;
}

/** 列表用：只回傳 metadata（不含 content），依日期新到舊排序、過濾草稿 */
export function getAllPostsMeta(): PostMeta[] {
  return fs
    .readdirSync(postDirectory)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map(parseFile)
    .filter(isVisible)
    .map(stripContent)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** 單篇用：回傳完整內容（含 content）。找不到或正式環境的草稿回傳 null */
export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const post = parseFile(`${slug}.mdx`);
  if (!isVisible(post)) return null;

  return post;
}

export type Taxonomy = { name: string; count: number };

// 依數量多到少、同數量再依名稱排序
function byCountThenName(a: Taxonomy, b: Taxonomy): number {
  return b.count - a.count || a.name.localeCompare(b.name);
}

/** 所有分類與各自的文章數 */
export function getAllCategories(): Taxonomy[] {
  const counts = new Map<string, number>();
  for (const post of getAllPostsMeta()) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort(byCountThenName);
}

/** 所有標籤與各自的文章數 */
export function getAllTags(): Taxonomy[] {
  const counts = new Map<string, number>();
  for (const post of getAllPostsMeta()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort(byCountThenName);
}

/** 某分類底下的文章（已過濾草稿、依日期排序） */
export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPostsMeta().filter((post) => post.category === category);
}

/** 某標籤底下的文章（已過濾草稿、依日期排序） */
export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPostsMeta().filter((post) => post.tags.includes(tag));
}

/** 所有系列與各自的文章數 */
export function getAllSeries(): Taxonomy[] {
  const counts = new Map<string, number>();
  for (const post of getAllPostsMeta()) {
    if (!post.series) continue;
    counts.set(post.series, (counts.get(post.series) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort(byCountThenName);
}

/** 某系列底下的文章，依日期由舊到新排序（系列通常從第一篇開始讀） */
export function getPostsBySeries(series: string): PostMeta[] {
  return getAllPostsMeta()
    .filter((post) => post.series === series)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export type Heading = {
  depth: number;
  text: string;
  slug: string;
};

// 去除標題內的 inline markdown，取得實際顯示文字（與 rehype-slug 取得的文字一致）
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // 圖片 → alt
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 連結 → 文字
    .replace(/`([^`]+)`/g, "$1") // 行內程式碼
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // 粗體
    .replace(/(\*|_)(.*?)\1/g, "$2") // 斜體
    .replace(/~~(.*?)~~/g, "$1") // 刪除線
    .trim();
}

/**
 * 擷取文章內的 h2/h3 標題供 TOC 使用。
 * 用 github-slugger 依「全部標題」的出現順序產生 slug，與 rehype-slug 的 id 完全對齊。
 */
export function extractHeadings(content: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();

    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (!match) continue;

    const depth = match[1].length;
    const text = stripInlineMarkdown(match[2]);
    const slug = slugger.slug(text); // 每個標題都要推進 slugger，維持與 rehype-slug 相同的去重狀態

    if (depth >= 2 && depth <= 3 && text) {
      headings.push({ depth, text, slug });
    }
  }

  return headings;
}

/** 依閱讀順序（日期新到舊）取得相鄰文章 */
export function getAdjacentPosts(slug: string): {
  newer: PostMeta | null;
  older: PostMeta | null;
} {
  const posts = getAllPostsMeta();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { newer: null, older: null };

  return {
    newer: index > 0 ? posts[index - 1] : null,
    older: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

/** 相關文章：同分類 +2 分、每個共同標籤 +1 分，取分數最高的前幾篇 */
export function getRelatedPosts(slug: string, limit = 3): PostMeta[] {
  const posts = getAllPostsMeta();
  const current = posts.find((post) => post.slug === slug);
  if (!current) return [];

  return posts
    .filter((post) => post.slug !== slug)
    .map((post) => {
      let score = 0;
      if (post.category === current.category) score += 2;
      score += post.tags.filter((tag) => current.tags.includes(tag)).length;
      return { post, score };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.post.date).getTime() - new Date(a.post.date).getTime(),
    )
    .slice(0, limit)
    .map((entry) => entry.post);
}
