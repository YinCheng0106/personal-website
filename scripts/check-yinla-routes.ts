import assert from "node:assert/strict";

const base = process.env.PROJECT_TEST_BASE_URL ?? "http://127.0.0.1:3000";
const canonical = "/projects/yinla-bot";
const legacy = "/projects/yinla-bot-website";
const publishedSlugs = [
  "dpip",
  "iso-countries-utils",
  "personai-api",
  "personal-website",
  "quotamew",
  "yinla-bot",
];

async function get(path: string) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  console.log(
    `${path}: ${response.status} ${response.headers.get("location") ?? ""}`,
  );
  return response;
}

const oldProject = await get(legacy);
assert.equal(oldProject.status, 308);
assert.equal(oldProject.headers.get("location"), canonical);

const oldProjectWithQuery = await get(`${legacy}?ref=legacy`);
assert.equal(oldProjectWithQuery.status, 308);
assert.equal(
  oldProjectWithQuery.headers.get("location"),
  `${canonical}?ref=legacy`,
);

const oldProjectWithSlash = await get(`${legacy}/`);
assert.equal(oldProjectWithSlash.status, 308);
assert.equal(oldProjectWithSlash.headers.get("location"), legacy);
assert.equal(
  (await get(oldProjectWithSlash.headers.get("location")!)).headers.get(
    "location",
  ),
  canonical,
);

const oldOg = await get(`${legacy}/og`);
assert.equal(oldOg.status, 308);
assert.equal(oldOg.headers.get("location"), `${canonical}/og`);
const canonicalOg = await get(`${canonical}/og`);
assert.equal(canonicalOg.status, 200);
assert.match(canonicalOg.headers.get("content-type") ?? "", /^image\/png/);

assert.equal((await get(`${legacy}/extra`)).status, 404);

for (const path of [
  "/",
  "/projects",
  ...publishedSlugs.map((slug) => `/projects/${slug}`),
]) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  assert.equal(response.headers.get("location"), null, path);
  if (path === "/projects") {
    const html = await response.text();
    assert.equal(html.match(/href="projects\/yinla-bot"/g)?.length, 1);
    assert.doesNotMatch(html, /href="projects\/yinla-bot-website"/);
  }
  if (path === canonical) {
    const html = await response.text();
    assert.match(
      html,
      /rel="canonical" href="https:\/\/yincheng\.app\/projects\/yinla-bot"/,
    );
    assert.match(html, /獨立產品網站/);
  }
}

const sitemap = await get("/sitemap.xml");
assert.equal(sitemap.status, 200);
const xml = await sitemap.text();
const projectUrls = [
  ...xml.matchAll(/<loc>(https:\/\/yincheng\.app\/projects\/[^/<]+)<\/loc>/g),
].map(([, url]) => url);
assert.equal(projectUrls.length, 6);
assert.equal(projectUrls.filter((url) => url.endsWith(canonical)).length, 1);
assert.equal(
  projectUrls.some((url) => url.endsWith(legacy)),
  false,
);

console.log("YINLA production-server route checks passed");
