# Blog 系統規劃文件

> 個人網站 Blog 系統的完整規劃與分階段路線圖
>
> - **內容來源策略**：維持 MDX 檔案（Git-based，零後台成本）
> - **最後更新**：2026-06-22
> - **適用專案**：`personal-website`（Next.js 16 App Router）

---

## 目錄

1. [規劃目標](#1-規劃目標)
2. [現況盤點](#2-現況盤點)
3. [缺口分析](#3-缺口分析)
4. [架構與技術選型](#4-架構與技術選型)
5. [資料模型（Frontmatter Schema）](#5-資料模型frontmatter-schema)
6. [路由與頁面地圖](#6-路由與頁面地圖)
7. [分階段路線圖](#7-分階段路線圖)
8. [各階段實作細節](#8-各階段實作細節)
9. [驗收檢核清單](#9-驗收檢核清單)
10. [風險與注意事項](#10-風險與注意事項)
11. [附錄](#11-附錄)

---

## 1. 規劃目標

打造一套**以 MDX 檔案為基礎、可長期維護**的個人技術部落格系統。核心原則：

- **零後台成本**：文章是 Git 控管的 `.mdx`，發文＝push，不需資料庫或 CMS。
- **型別安全**：Frontmatter 經過驗證，缺欄位在 build 階段就報錯，而非執行期才壞掉。
- **SEO 與訂閱友善**：每篇文章有 OG 圖、structured data、RSS、Sitemap。
- **良好閱讀體驗**：TOC、閱讀進度、上下篇導覽、分類/標籤聚合頁。
- **沿用既有慣例**：不引入不必要的新框架，跟著現有的 `(main)` route group、`takumi-js` OG、`shiki`、`motion`、`date-fns` 等慣例走。

本文件鎖定三個優先補強方向：**分類與標籤頁**、**TOC 與閱讀體驗**、**RSS / Sitemap / SEO**。

---

## 2. 現況盤點

目前已有一套可運作的 blog 雛型，盤點如下：

### 2.1 已完成

| 類別 | 檔案 | 說明 |
| --- | --- | --- |
| 資料層 | `src/lib/posts.ts` | 讀 `src/contents/posts/*.mdx`，用 `gray-matter` 解析 frontmatter、`reading-time` 算閱讀時間、`date-fns` 格式化日期，依日期新到舊排序 |
| 列表頁 | `src/app/(main)/blog/page.tsx` | 文章列表，grid 排版，含完整 Metadata + OG |
| 單篇頁 | `src/app/(main)/blog/[slug]/page.tsx` | 用 `next-mdx-remote/rsc` 的 `MDXRemote` 渲染，含 `remark-gfm`、`generateMetadata` |
| 卡片 | `src/components/app/blogCard.tsx` | `BlobCard`，含 `motion` 進場動畫、日期、閱讀時間、tags |
| MDX 元件 | `src/components/mdx/mdx-components.tsx` | 自訂 h1~h6、p、a、table、pre、code、Callout |
| 語法高亮 | `src/components/mdx/code.tsx` | 用 `shiki`（github-light / github-dark，`light-dark()`），**已接好** |
| 程式碼區塊 | `src/components/mdx/code-block.tsx` + `copy-button.tsx` | 含一鍵複製 |
| OG 圖 | `src/lib/og.tsx`、`blog/og/route.tsx`、`blog/[slug]/og/route.tsx` | 用 `takumi-js` 動態生成 OG，`OgFrameBlog` 已含標題/描述/日期/閱讀時間 |

### 2.2 現有 `Post` 型別

```ts
// src/lib/posts.ts
export type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  category: string;      // ⚠️ 有定義、有寫入 frontmatter，但全站尚未使用
  tags: string[];        // ⚠️ 有渲染，但無對應的標籤聚合頁
  readingTime: string;
  formatDate: string;
  content: string;
};
```

### 2.3 技術堆疊（已安裝）

- **框架**：Next.js 16.0.7（App Router）、React 19、TypeScript 5
- **MDX**：`@next/mdx`、`@mdx-js/loader`、`@mdx-js/react`、`next-mdx-remote`、`@types/mdx`
- **內容處理**：`gray-matter`、`reading-time`、`remark-gfm`、`remark-toc`、`shiki`、`rss-parser`
- **樣式**：Tailwind v4、`@tailwindcss/typography`、`tw-animate-css`、`motion`
- **OG**：`takumi-js`（`serverExternalPackages: ["@takumi-rs/core"]`）
- **其他**：`date-fns`、`lucide-react`、`@iconify-icon/react`、`next-themes`

> 注意：`remark-toc`、`rss-parser` 已在 `package.json` 但尚未使用。`rss-parser` 是「解析」RSS 用的，**產生** RSS feed 需另外處理（見 §8.6）。

---

## 3. 缺口分析

依優先級分類目前缺少的能力：

### 3.1 基礎整備（建議最先處理）

| 缺口 | 影響 | 嚴重度 |
| --- | --- | --- |
| `[slug]/page.tsx` 沒有 `generateStaticParams` | 文章未走 SSG，每次請求動態渲染，較慢且浪費 | 高 |
| Frontmatter 無驗證，直接 `as string` 轉型 | 漏欄位／打錯字只會在執行期靜默壞掉 | 高 |
| `getAllPosts` 列表時讀取每篇完整 content | 文章變多後列表頁變慢 | 中 |
| 無草稿（draft）機制 | 無法寫到一半先 commit | 中 |
| MDX 標題沒有 `id`／錨點 | 無法做 TOC 跳轉、無法分享段落連結 | 中 |

### 3.2 優先補強功能（本次重點）

| 功能 | 現況 | 對應階段 |
| --- | --- | --- |
| 分類頁 `/blog/category/[category]` | `category` 欄位閒置 | Phase 1 |
| 標籤頁 `/blog/tag/[tag]` | 程式碼有 `{/* 預留Tags 可以連結到 TagsPage */}` 註解 | Phase 1 |
| 文章內 TOC（目錄） | 無 | Phase 2 |
| 閱讀進度條 | 無 | Phase 2 |
| 上一篇／下一篇、相關文章 | 無 | Phase 2 |
| RSS / Atom feed | 無 | Phase 3 |
| `sitemap.xml` / `robots.txt` | 無 | Phase 3 |
| JSON-LD structured data | 無 | Phase 3 |

### 3.3 加分功能（後續視需求）

- 站內搜尋（標題／標籤／全文）
- 留言系統（建議 Giscus，基於 GitHub Discussions）
- 瀏覽數統計
- 文章系列（series）分組
- 封面圖（cover image）與作者資訊
- 分頁（pagination）／無限捲動

---

## 4. 架構與技術選型

### 4.1 內容來源：維持 MDX（已定案）

```
作者寫作  →  src/contents/posts/*.mdx  →  Git commit/push  →  Vercel build (SSG)  →  上線
```

**優點**：零後台、版本控管、型別安全、適合工程師寫作、可在編輯器直接寫。
**取捨**：發文需要重新 build/deploy（對個人站可接受；Vercel push 自動觸發）。

### 4.2 渲染策略

- 統一使用 **`next-mdx-remote/rsc` 的 `MDXRemote`**（現況做法），不混用 `@next/mdx` 的檔案路由，避免兩套 MDX pipeline 混淆。
  - 可評估後續把 `@next/mdx`、`@mdx-js/loader` 從相依移除（除非有用到 `.mdx` 當頁面）。
- 文章頁加 `generateStaticParams` → 走 **SSG**，建置期產生靜態頁。

### 4.3 remark / rehype 外掛規劃

文章 MDX pipeline 統一在 `posts.ts` 或文章頁設定，建議組合：

| 外掛 | 用途 | 安裝狀態 |
| --- | --- | --- |
| `remark-gfm` | 表格、刪除線、自動連結 | ✅ 已用 |
| `rehype-slug` | 給標題加 `id`（TOC 與錨點的前提） | ✅ 已安裝並啟用（Phase 0） |
| `remark-toc`（選用） | 內文中插入目錄；若做側欄 TOC 則改自行擷取 heading | ✅ 已安裝（未用） |

> **錨點實作決定**：不採用 `rehype-autolink-headings`。原因是自訂的 `a` MDX 元件只取 `href`/`children`、會吃掉注入的 className，導致錨點無法控制樣式、且會被染成內文連結色而破壞既有視覺。改為在 `mdx-components.tsx` 的 heading 元件內，用既有 token（`text-muted-foreground hover:text-foreground`、`group-hover:opacity-100`）自行渲染 hover 的 `#` 錨點，樣式完全可控。

> 程式碼高亮已用 `shiki` 在 `Code` 元件內處理，**不需**再加 `rehype-pretty-code`／`rehype-highlight`，避免重複。

### 4.4 Frontmatter 驗證：導入 `zod`

用 `zod` 定義 schema，集中在 `posts.ts` 驗證，缺欄位／型別錯在 build 期就丟錯。

---

## 5. 資料模型（Frontmatter Schema）

### 5.1 標準 Frontmatter

```yaml
---
title: "文章標題"              # 必填
date: "2026-06-22"            # 必填，YYYY-MM-DD
description: "一句話描述"       # 必填，用於卡片與 SEO
category: "技術文章"           # 必填，單一分類
tags: ["Next.js", "MDX"]      # 選填，多個標籤
draft: false                  # 選填，預設 false；true 則不在正式環境顯示
cover: "/posts/xxx/cover.png" # 選填，封面圖（後續階段）
series: "從零打造個人網站"      # 選填，系列名稱（後續階段）
updated: "2026-06-25"         # 選填，最後更新日
---
```

### 5.2 衍生欄位（程式計算，非寫在 frontmatter）

- `slug`：由檔名推導（`xxx.mdx` → `xxx`）
- `readingTime`：`reading-time` 計算
- `formatDate`：`date-fns` 格式化
- `headings`：擷取 `##`/`###` 供 TOC（Phase 2）

### 5.3 建議的 `posts.ts` 型別（含驗證）

```ts
import { z } from "zod";

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

export type PostMeta = z.infer<typeof FrontmatterSchema> & {
  slug: string;
  readingTime: string;
  formatDate: string;
};

export type Post = PostMeta & { content: string };
```

> **草稿規則**：`getAllPosts()` 在 `process.env.NODE_ENV === "production"` 時過濾掉 `draft: true`；開發環境照常顯示，方便預覽。

---

## 6. 路由與頁面地圖

```
/blog                              文章列表（首頁，含分頁）
/blog/[slug]                       單篇文章
/blog/[slug]/og                    單篇 OG 圖（已有）
/blog/og                           列表 OG 圖（已有）
/blog/category                     所有分類總覽          ← Phase 1
/blog/category/[category]          某分類下的文章         ← Phase 1
/blog/tag                          所有標籤總覽（tag cloud）← Phase 1
/blog/tag/[tag]                    某標籤下的文章         ← Phase 1
/rss.xml  (或 /feed.xml)           RSS feed              ← Phase 3
/sitemap.xml                       Sitemap（含所有文章）  ← Phase 3
/robots.txt                        Robots                ← Phase 3
```

所有頁面沿用 `src/app/(main)/` route group（共用 `AppHeader` / `AppFooter` / container 版型）。

---

## 7. 分階段路線圖

> 每個 Phase 可獨立交付、獨立上線。建議依序進行；Phase 0 是其他階段的地基。

| Phase | 主題 | 內容摘要 | 相依 | 狀態 |
| --- | --- | --- | --- | --- |
| **0** | 基礎整備 | SSG、Frontmatter 驗證、草稿、列表效能、標題錨點 | — | ✅ 完成 |
| **1** | 分類與標籤頁 ⭐ | category/tag 聚合頁與總覽頁、卡片可點 tag | Phase 0 | ✅ 完成 |
| **2** | TOC 與閱讀體驗 ⭐ | 側欄 TOC、閱讀進度條、上下篇、相關文章 | Phase 0 | ✅ 完成 |
| **3** | RSS / Sitemap / SEO ⭐ | RSS feed、sitemap、robots、JSON-LD | Phase 0 | ✅ 完成 |
| **4** | 進階功能 | 站內搜尋、文章系列、封面圖、分頁 | Phase 1~2 | ✅ 完成 |
| **5** | 社群與數據 | 留言（Giscus）、瀏覽數 | Phase 3 | ✅ 完成（env 驅動，待填值啟用） |

> **Phase 5 啟用方式**：留言與瀏覽數皆已接好、用環境變數驅動，**未設定時自動隱藏、不影響版面與 build**。填入 `.env.example` 列出的值即可啟用：
> - **Giscus 留言**：到 [giscus.app](https://giscus.app) 設定後填 `NEXT_PUBLIC_GISCUS_REPO`/`_REPO_ID`/`_CATEGORY`/`_CATEGORY_ID`（repo 需 public＋裝 giscus app＋開 Discussions）。
> - **瀏覽數**：到 [upstash.com](https://upstash.com) 建 Redis 後填 `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`。

⭐ = 本次指定優先項目。

---

## 8. 各階段實作細節

### 8.0 Phase 0：基礎整備

**目標**：把現有雛型升級成穩固地基。

1. **導入 Frontmatter 驗證**（`src/lib/posts.ts`）
   - 安裝 `zod`，以 §5.3 schema 驗證每篇 frontmatter，錯誤訊息帶上檔名。

2. **文章頁 SSG**（`src/app/(main)/blog/[slug]/page.tsx`）
   ```ts
   export async function generateStaticParams() {
     return getAllPosts().map((post) => ({ slug: post.slug }));
   }
   export const dynamicParams = false; // 非清單內的 slug 直接 404
   ```

3. **草稿機制**：`getAllPosts()` 於 production 過濾 `draft: true`（見 §5.3）。

4. **列表效能**：拆出 `getAllPostsMeta()`（只回傳 metadata、不含 `content`），列表頁／分類頁／RSS 都用它；`getPostBySlug()` 才回傳完整 `content`。

5. **標題錨點**：安裝 `rehype-slug` 並加入 `MDXRemote` 的 `rehypePlugins`，讓每個標題有 `id`（Phase 2 TOC 的前提）；hover 的 `#` 錨點在 heading 元件內自行渲染（見 §4.3 錨點實作決定）。

**新增相依**：`zod`、`rehype-slug`（`github-slugger` 先裝起來給 Phase 2 用）

> ✅ **Phase 0 已完成並通過 build 驗證**：文章為 SSG（`/blog/test`、`/blog/table` 預渲染）、草稿在正式 build 被排除、缺欄位的 frontmatter 會讓 build 失敗並指出檔名與欄位、標題帶 `id` 與 hover `#` 錨點。

---

### 8.1 Phase 1：分類與標籤頁 ⭐

> ✅ **Phase 1 已完成並通過 build/lint 驗證**：4 個新頁面皆 SSG（總覽頁為 static、`[category]`/`[tag]` 為 SSG，中文 slug 正常）；卡片改 overlay link 後**巢狀 `<a>` 為 0**、tag 可點；文章頁 category/tags 可點；`/blog` 加上分類/標籤總覽入口。lint 0 errors。

**目標**：讓閒置的 `category`／`tags` 變成可瀏覽的聚合頁。

**實作備註（與原規劃的差異）**：
- 卡片 tag 可點採 **overlay link 模式**（`Card` 設 `relative`、整張卡用 `absolute inset-0 z-0` 的 `Link` 覆蓋、tag 用 `relative z-10` 浮於其上），避免巢狀 `<a>`，視覺與原本完全一致。
- tag/category 連結善用 `Badge` 的 `asChild` 直接包 `Link`，沿用既有 `[a&]:hover:` 樣式。
- 分類總覽用 `Card` grid（名稱＋篇數）、標籤總覽用 `Badge` 雲（名稱＋篇數），皆為既有元件。

**資料層（`src/lib/posts.ts` 新增）**
```ts
export function getAllCategories(): { name: string; count: number }[] { /* ... */ }
export function getAllTags(): { name: string; count: number }[] { /* ... */ }
export function getPostsByCategory(category: string): PostMeta[] { /* ... */ }
export function getPostsByTag(tag: string): PostMeta[] { /* ... */ }
```

**新增頁面**
| 路徑 | 檔案 | 說明 |
| --- | --- | --- |
| `/blog/category` | `app/(main)/blog/category/page.tsx` | 分類總覽（每分類含文章數） |
| `/blog/category/[category]` | `app/(main)/blog/category/[category]/page.tsx` | 該分類文章列表，含 `generateStaticParams` |
| `/blog/tag` | `app/(main)/blog/tag/page.tsx` | 標籤雲（tag cloud） |
| `/blog/tag/[tag]` | `app/(main)/blog/tag/[tag]/page.tsx` | 該標籤文章列表，含 `generateStaticParams` |

**元件調整**
- `blogCard.tsx`：tags 改為連到 `/blog/tag/[tag]`（注意卡片本身是 `<Link>`，標籤需用 `<span onClick>` + `router.push` 或調整巢狀結構，避免 `<a>` 巢狀）。
- `blog/[slug]/page.tsx`：把 `{/* 預留Tags 可以連結到 TagsPage */}` 換成實際連結；category 也加上可點連結。
- 可重用 `SectionTitle`、`Badge`、`BlobCard`。

**URL 編碼**：中文分類／標籤要 `encodeURIComponent`；`generateStaticParams` 回傳原字串即可，Next 會處理。

---

### 8.2 Phase 2：TOC 與閱讀體驗 ⭐

> ✅ **Phase 2 已完成並通過 build/lint 驗證**：側欄 TOC（xl 以上顯示、`IntersectionObserver` 高亮、slug 與 `rehype-slug` 的 id 經測試完全一致）、頂部閱讀進度條（`motion` `useScroll`/`useSpring`）、文末上一篇/下一篇、相關文章（同分類＋共同標籤加權）。無 heading 的文章版型與原本完全相同。

**目標**：長文好讀、好導覽。

**實作備註**：
- 版型用 `max-w-7xl` 外層＋`flex justify-center gap-12`，TOC 為 `hidden xl:block w-56` 的 `sticky` 側欄；沒有 h2/h3 的文章不顯示側欄，版面與改動前一致。
- `extractHeadings` 用 `github-slugger` 並對「所有」標題推進去重狀態（含 h1/h4-6），確保與 `rehype-slug` 的 id 對齊；同時略過 ``` code fence。
- 上下篇以「較新／較舊」標示，避免「上一篇」語意混淆。

1. **側欄 TOC**
   - 在 `posts.ts` 新增 `extractHeadings(content)`：用正則或 `mdast` 擷取 `##`/`###`，產生 `{ depth, text, slug }[]`（slug 規則需與 `rehype-slug` 一致）。
   - 新增 `src/components/app/tableOfContents.tsx`（client component）：
     - 桌機固定在文章右側（`sticky top-24`），手機收進可展開區塊。
     - 用 `IntersectionObserver` 高亮目前閱讀到的段落。
   - 文章頁版型改為「內容 + 右側 TOC」的兩欄（`lg:grid-cols-[1fr_240px]`）。

2. **閱讀進度條**
   - 新增 `src/components/app/readingProgress.tsx`（client）：監聽 scroll，頂部一條進度條；可用 `motion` 的 `useScroll` + `scaleX`。

3. **上一篇／下一篇**
   - `posts.ts` 新增 `getAdjacentPosts(slug)` 回傳 `{ prev, next }`（依日期排序的前後篇）。
   - 文章底部新增 `PostNav` 元件。

4. **相關文章**
   - `posts.ts` 新增 `getRelatedPosts(slug, limit = 3)`：以「相同 category／共同 tags 數」加權排序。
   - 文章底部以 `BlobCard` 呈現。

**新增相依**：無（`motion` 已有；heading 擷取可用 `unist-util-visit` 或正則，正則零相依）。

---

### 8.3 Phase 3：RSS / Sitemap / SEO ⭐

> ✅ **Phase 3 已完成並通過 build 驗證**：`/rss.xml`（`feed` 套件、`force-static`、含分類/標籤）、`/sitemap.xml`（20 筆：靜態頁＋文章＋分類＋標籤，中文已編碼）、`/robots.txt`（指向 sitemap）、文章頁 `BlogPosting` JSON-LD、root layout 加 `metadataBase` 與 RSS alternate link、新增 `src/lib/site.ts` 集中站台設定。

**目標**：可被訂閱、可被搜尋引擎完整索引。

1. **RSS / Atom feed**
   - 新增 `src/app/rss.xml/route.ts`（Route Handler，回傳 `application/xml`）。
   - 建議安裝 `feed` 套件產生標準 RSS 2.0 / Atom（比手刻字串可靠）。
   - 內容取 `getAllPostsMeta()`（過濾草稿），含標題、描述、連結、日期、分類。
   - 在 `app/layout.tsx` `<head>` 加 `<link rel="alternate" type="application/rss+xml">`。

2. **Sitemap**
   - 用 Next 內建 **`app/sitemap.ts`**（`MetadataRoute.Sitemap`），列出首頁、`/blog`、每篇文章、分類頁、標籤頁，含 `lastModified`。

3. **robots.txt**
   - 用 Next 內建 **`app/robots.ts`**（`MetadataRoute.Robots`），指向 `sitemap.xml`。

4. **JSON-LD structured data**
   - 文章頁注入 `BlogPosting` schema（`headline`、`datePublished`、`dateModified`、`author`、`image` 用 OG URL）。
   - 列表頁可注入 `Blog` / `Breadcrumb`。
   - 以 `<script type="application/ld+json">` 內嵌。

5. **Metadata 收斂**
   - 把目前散落在各 `page.tsx` 的 `https://yincheng.app` 硬編碼，集中到 `src/lib/site.ts`（`siteConfig`），並設定 `metadataBase`，減少重複。

**新增相依**：`feed`（選用，建議）。

---

### 8.4 Phase 4：進階功能 ✅

> ✅ **已完成並通過 build/lint/runtime 驗證**。

- **站內搜尋＋分頁**：`components/app/blogList.tsx`（client）用 `fuse.js` 對 title/description/tags/category 模糊搜尋，並做 client 分頁（每頁 6 篇、超過才顯示控制鈕）。`/blog` 改用此元件，頁面仍為靜態（posts 於 build 期序列化傳入）。實作上把搜尋與分頁整合在同一元件，未拆 `/blog/page/[n]` 路由。
- **文章系列**：`series` frontmatter → `getAllSeries`/`getPostsBySeries`、文章內系列導覽框（本篇高亮、連到其他篇與系列頁）、`/blog/series/[series]` 頁面、納入 sitemap。
- **封面圖**：`cover` frontmatter → `BlobCard` 卡片頂部與文章頁 banner（`next/image`）。**無 cover 時版面與先前完全一致**。

### 8.5 Phase 5：社群與數據 ✅（env 驅動）

> ✅ **已接好並通過驗證**，用環境變數驅動，未設定時自動隱藏。

- **留言（Giscus）**：`components/app/comments.tsx`，`@giscus/react`，`mapping="pathname"`、主題隨 `next-themes` 切換、`lang="zh-TW"`；讀 `NEXT_PUBLIC_GISCUS_*`，未設定 → 不渲染。嵌於文章底部。
- **瀏覽數**：`lib/redis.ts`（`@upstash/redis`，env 存在才建立）＋ `app/api/views/[slug]/route.ts`（GET 讀取／POST 遞增）＋ `components/app/viewCounter.tsx`（client，`sessionStorage` 防重複計數）。未設定 Upstash → API 回 `{ views: null }`，計數器不顯示，文章頁仍正常（已 runtime 驗證）。

### 8.6 備註：RSS 相依澄清

`package.json` 內的 `rss-parser` 是**讀取**外部 RSS 用的（例如顯示別人的 feed），**不能拿來產生**自己的 feed。產生 feed 請用 `feed` 套件或手刻 XML（見 §8.3）。若 `rss-parser` 無其他用途，可考慮移除。

---

## 9. 驗收檢核清單

### Phase 0
- [ ] 漏寫必填 frontmatter 時，build 會明確報錯並指出檔名
- [ ] 文章頁為靜態產生（build log 顯示為 ● SSG / prerendered）
- [ ] `draft: true` 的文章在 `next build` 後的正式站看不到，`next dev` 看得到
- [ ] 每個 `##`/`###` 標題都有 `id` 且可用 `#id` 直接跳轉

### Phase 1
- [ ] `/blog/category` 與 `/blog/tag` 總覽頁列出所有分類／標籤與數量
- [ ] 點卡片上的 tag 會進到對應標籤頁（且不破壞卡片本身的連結）
- [ ] 分類／標籤頁皆為 SSG，中文 slug 正常運作

### Phase 2
- [ ] 長文右側出現 TOC，捲動時高亮對應段落，點擊可跳轉
- [ ] 頂部閱讀進度條隨捲動更新
- [ ] 文章底部有上一篇／下一篇與相關文章

### Phase 3
- [ ] `/rss.xml` 回傳合法 XML，可被 RSS 閱讀器訂閱
- [ ] `/sitemap.xml` 含所有文章與聚合頁
- [ ] `/robots.txt` 指向 sitemap
- [ ] 文章頁 source 含 `BlogPosting` JSON-LD，通過 Google Rich Results Test

---

## 10. 風險與注意事項

1. **巢狀 `<a>`**：`BlobCard` 整張是 `<Link>`，內部 tag 再放 `<Link>` 會產生不合法的巢狀 `<a>`。改用按鈕＋`router.push`，或把 tag 移出卡片連結範圍。
2. **TOC slug 一致性**：自行擷取 heading 的 slug 規則，必須與 `rehype-slug` 產生的 `id` 完全一致，否則跳轉失效。建議用相同的 slugify 邏輯（`github-slugger`）。
3. **中文 URL**：分類／標籤含中文時，連結要 `encodeURIComponent`，顯示時 `decodeURIComponent`。
4. **OG 快取**：`getOgImageResponse` 已設 `Cache-Control`；新文章 OG 在 CDN 快取期內可能延遲更新，必要時帶版本參數。
5. **MDX pipeline 單一化**：避免 `@next/mdx`（檔案路由）與 `next-mdx-remote`（執行期）同時生效造成混淆，統一走後者。
6. **`date` 時區**：`new Date("2026-06-22")` 會被當 UTC 午夜，跨時區可能差一天；格式化顯示時留意，必要時固定以 UTC 處理。
7. **建置時間**：文章量大後 SSG 建置變慢屬正常；個人站規模通常無虞。

---

## 11. 附錄

### 11.1 文章 Frontmatter 範本

新文章建議從這份範本開始，存成 `src/contents/posts/<slug>.mdx`：

```mdx
---
title: "你的文章標題"
date: "2026-06-22"
description: "一句話描述這篇文章在講什麼"
category: "技術文章"
tags: ["Next.js", "TypeScript"]
draft: true
---

## 前言

正文開始⋯⋯
```

### 11.2 規劃後的目錄結構

```
src/
├── app/
│   ├── (main)/
│   │   └── blog/
│   │       ├── page.tsx                    # 列表
│   │       ├── og/route.tsx                # 列表 OG（已有）
│   │       ├── [slug]/
│   │       │   ├── page.tsx                # 單篇（+ generateStaticParams）
│   │       │   └── og/route.tsx            # 單篇 OG（已有）
│   │       ├── category/
│   │       │   ├── page.tsx                # 分類總覽        ← P1
│   │       │   └── [category]/page.tsx     # 單一分類        ← P1
│   │       └── tag/
│   │           ├── page.tsx                # 標籤雲          ← P1
│   │           └── [tag]/page.tsx          # 單一標籤        ← P1
│   ├── rss.xml/route.ts                    # RSS            ← P3
│   ├── sitemap.ts                          # Sitemap        ← P3
│   └── robots.ts                           # Robots         ← P3
├── components/
│   ├── app/
│   │   ├── blogCard.tsx                    # 既有（tag 改可點）
│   │   ├── tableOfContents.tsx             # TOC            ← P2
│   │   ├── readingProgress.tsx             # 進度條          ← P2
│   │   └── postNav.tsx                     # 上下篇          ← P2
│   └── mdx/                                # 既有 MDX 元件
├── contents/posts/*.mdx                    # 文章
└── lib/
    ├── posts.ts                            # 擴充：分類/標籤/相鄰/相關/heading
    ├── og.tsx                              # 既有
    └── site.ts                             # 站台設定集中    ← P3
```

### 11.3 建議新增相依一覽

| 套件 | 用途 | 對應階段 |
| --- | --- | --- |
| `zod` | Frontmatter 驗證 | Phase 0 ✅ |
| `rehype-slug` | 標題 id | Phase 0 ✅ |
| `github-slugger` | TOC slug 與 rehype-slug 對齊 | Phase 2（已先安裝） |
| `feed` | 產生 RSS / Atom | Phase 3 |
| `fuse.js` | 站內模糊搜尋（選用） | Phase 4 |

> 可移除候選：若未用到 `.mdx` 檔案路由可評估移除 `@next/mdx`、`@mdx-js/loader`；若 `rss-parser` 無其他用途亦可移除。

---

*本文件為規劃藍圖，實作時各階段可再細化。*
