import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const base = process.env.PROJECT_TEST_BASE_URL ?? "http://127.0.0.1:3000";
const articlePath = "/projects/quotamew/case-study";
const canonical = `https://yincheng.app${articlePath}`;
const title = "QuotaMew｜因為一個太吃記憶體的工具，我決定自己做一個 macOS App";

async function get(path: string, status: number) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, status, path);
  const body = await response.text();
  assert.doesNotMatch(
    body,
    /CASE_STUDY_[A-Z0-9_]+_INTERNAL_FIXTURE|data-case-study-fixture|synthetic fixture|\/Users\/|\/home\//,
    path,
  );
  console.log(`${path}: ${status}`);
  return body;
}

const html = await get(articlePath, 200);
assert.match(html, new RegExp(`<title>${title} \\| YinCheng</title>`));
assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
assert.ok(html.includes(`property="og:url" content="${canonical}"`));
assert.ok(html.includes(`property="og:title" content="${title}"`));
assert.match(html, /property="og:type" content="article"/);
assert.match(html, /name="twitter:card" content="summary_large_image"/);
assert.ok(html.includes(`name="twitter:title" content="${title}"`));
assert.match(
  html,
  /name="twitter:image" content="https:\/\/yincheng.app\/projects\/quotamew\/og"/,
);
assert.match(
  html,
  /name="description" content="原生 macOS 選單列 App[^"<>]+其實一開始，我沒有特別打算要開發 macOS App。"/,
);
const articleHtml = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
assert.ok(articleHtml, "missing rendered article");
assert.equal(articleHtml.match(/<h1\b/g)?.length, 1);
assert.equal(articleHtml.match(/<h2\b/g)?.length, 9);
assert.match(html, /<article\b/);
assert.match(html, /<table\b/);
assert.match(html, /scope="col"/);
assert.match(
  html,
  /role="region" aria-label="文章表格，可水平捲動" tabindex="0"/,
);
for (const text of [
  "我主要負責思考自己需要哪些功能",
  "大部分程式碼其實是由 AI 協助完成的",
  "codex app-server",
  "stdio",
  "實驗性、尚未完整驗證",
  "Apple Developer Program",
  "約略記憶體用量",
  "12 MB",
  "50 MB",
  "這些數字只是開發期間的初步觀察",
  "還沒有做完整的效能基準測試",
  "這些目前都還只是規劃",
])
  assert.ok(html.includes(text), text);
for (const href of [
  "/projects/quotamew",
  "https://github.com/YinCheng0106/QuotaMew",
  "https://github.com/YinCheng0106/QuotaMew-docs",
])
  assert.ok(html.includes(`href="${href}"`), href);
assert.doesNotMatch(
  html,
  /src\/contents\/case-studies|internal path|ENOENT|EACCES/,
);

// Check every approved source line against the actual article subtree. This
// catches truncation near the end as well as omissions between section anchors.
function plainText(text: string) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, "");
}
async function assertCompleteArticle(slug: string, html: string) {
  const body = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
  assert.ok(body, slug);
  const rendered = plainText(body);
  const source = await readFile(
    `src/contents/case-studies/${slug}.mdx`,
    "utf8",
  );
  for (const line of source.split("\n")) {
    if (!line.trim() || /^[-|: ]+$/.test(line)) continue;
    const markdown = line
      .replace(/^#{1,6} /, "")
      .replace(/^(?:- |\d+\. )/, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*\*|`/g, "")
      .replace(/\\$/, "");
    for (const cell of markdown.startsWith("|")
      ? markdown.split("|")
      : [markdown]) {
      const expected = plainText(cell);
      if (expected)
        assert.ok(
          rendered.includes(expected),
          `${slug}: missing approved text: ${cell}`,
        );
    }
  }
  assert.doesNotMatch(
    body,
    /<img|<video|<iframe|<svg/,
    `${slug}: unapproved media`,
  );
}
await assertCompleteArticle("quotamew", html);

const dpipPath = "/projects/dpip/case-study";
const dpipCanonical = `https://yincheng.app${dpipPath}`;
const dpipTitle =
  "DPIP｜第一次把 Flutter 跟 SwiftUI 結合，開發 iOS 天氣 Widget";
const dpipHtml = await get(dpipPath, 200);
await assertCompleteArticle("dpip", dpipHtml);
assert.ok(dpipHtml.includes(`<title>${dpipTitle} | YinCheng</title>`));
assert.ok(dpipHtml.includes(`rel="canonical" href="${dpipCanonical}"`));
assert.ok(dpipHtml.includes(`property="og:url" content="${dpipCanonical}"`));
assert.ok(dpipHtml.includes(`property="og:title" content="${dpipTitle}"`));
assert.match(dpipHtml, /property="og:type" content="article"/);
assert.match(dpipHtml, /name="twitter:card" content="summary_large_image"/);
assert.ok(dpipHtml.includes(`name="twitter:title" content="${dpipTitle}"`));
assert.ok(
  dpipHtml.includes(
    'name="twitter:image" content="https://yincheng.app/projects/dpip/og"',
  ),
);
const description =
  "ExpTechTW 團隊開發的臺灣防災資訊 App，整合地震、天氣與災害示警；我參與 iOS 天氣小工具的實作與整合。 其實一開始，DPIP 團隊並沒有特別規劃要開發 iOS 天氣 Widget。";
for (const attribute of [
  'name="description"',
  'property="og:description"',
  'name="twitter:description"',
])
  assert.ok(dpipHtml.includes(`${attribute} content="${description}"`));
const dpipBody = dpipHtml.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)![1];
assert.equal(dpipBody.match(/<h1\b/g)?.length, 1);
assert.equal(dpipBody.match(/<h2\b/g)?.length, 9);
assert.match(
  dpipBody,
  /role="region" aria-label="文章表格，可水平捲動" tabindex="0"/,
);
assert.match(dpipBody, /scope="col"/);
for (const id of [576, 579, 580, 582, 607, 608, 629])
  assert.ok(
    dpipBody.includes(`href="https://github.com/ExpTechTW/DPIP/pull/${id}"`),
  );
assert.doesNotMatch(
  dpipHtml,
  /src\/contents\/case-studies|internal path|ENOENT|EACCES/,
);

// All six product canonicals and gated links retain their existing identity.
for (const slug of [
  "dpip",
  "quotamew",
  "personai-api",
  "yinla-bot",
  "personal-website",
  "iso-countries-utils",
]) {
  const projectHtml = await get(`/projects/${slug}`, 200);
  assert.ok(
    projectHtml.includes(
      `rel="canonical" href="https://yincheng.app/projects/${slug}"`,
    ),
  );
  const links = [
    ...projectHtml.matchAll(/href="(\/projects\/[^/]+\/case-study)"/g),
  ].map(([, href]) => href);
  assert.deepEqual(
    links,
    ["dpip", "quotamew"].includes(slug) ? [`/projects/${slug}/case-study`] : [],
  );
}

for (const path of [
  "/case-studies",
  "/case-studies/quotamew",
  "/case-studies/quotamew/og",
  "/case-studies/quotamew.mdx",
  `${articlePath}/og`,
  `${articlePath}.mdx`,
  "/blog/quotamew",
  "/blog/quotamew/og",
  "/contents/case-studies/quotamew.mdx",
  "/src/contents/case-studies/quotamew.mdx",
  "/contents/case-studies/dpip.mdx",
  "/src/contents/case-studies/dpip.mdx",
  "/case-studies/dpip.mdx",
  "/case-studies/dpip",
  "/case-studies/dpip/og",
  "/projects/dpip/case-study/og",
  "/projects/dpip/case-study.mdx",
  "/blog/dpip",
  "/blog/dpip/og",
  "/projects/personai-api/case-study",
  "/projects/yinla-bot/case-study",
  "/projects/personal-website/case-study",
  "/projects/iso-countries-utils/case-study",
  "/projects/missing-project/case-study",
  "/projects/personai-api/case-study?preview=true",
  "/projects/yinla-bot-website/case-study",
]) {
  const body = await get(path, 404);
  assert.doesNotMatch(
    body,
    /其實一開始，我沒有特別打算要開發 macOS App|這個功能是我自己提出來的。/,
  );
}

for (const path of [
  "/",
  "/projects",
  "/projects/quotamew",
  "/blog",
  "/sitemap.xml",
]) {
  const body = await get(path, 200);
  if (path === "/projects/quotamew") {
    assert.match(
      body,
      /rel="canonical" href="https:\/\/yincheng.app\/projects\/quotamew"/,
    );
    assert.ok(body.includes(`href="${articlePath}"`));
  }
  if (path === "/sitemap.xml") {
    const articleUrls = [
      ...body.matchAll(/<loc>([^<]*case-study[^<]*)<\/loc>/g),
    ].map(([, url]) => url);
    assert.deepEqual(
      articleUrls.sort(),
      [canonical, "https://yincheng.app/projects/dpip/case-study"].sort(),
    );
  }
}

console.log(
  "Approved Case Study production-server acceptance passed (local HTTP only)",
);
