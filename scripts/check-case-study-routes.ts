import assert from "node:assert/strict";

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
    /CASE_STUDY_QUOTAMEW_INTERNAL_FIXTURE|data-case-study-fixture|synthetic fixture|\/Users\/|\/home\//,
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
  "/projects/dpip/case-study",
  "/projects/personai-api/case-study",
  "/projects/yinla-bot/case-study",
  "/projects/personal-website/case-study",
  "/projects/iso-countries-utils/case-study",
  "/projects/missing-project/case-study",
  "/projects/dpip/case-study?preview=true",
  "/projects/yinla-bot-website/case-study",
]) {
  const body = await get(path, 404);
  assert.doesNotMatch(body, /其實一開始，我沒有特別打算要開發 macOS App/);
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
    assert.deepEqual(articleUrls, [canonical]);
  }
}

console.log(
  "Approved Case Study production-server acceptance passed (local HTTP only)",
);
