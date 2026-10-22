import assert from "node:assert/strict";

const base = process.env.PROJECT_TEST_BASE_URL ?? "http://127.0.0.1:3000";
const marker = "CASE_STUDY_QUOTAMEW_INTERNAL_FIXTURE";

// A production-server smoke check; no preview endpoint exists in any environment.
for (const path of [
  "/case-studies",
  "/case-studies/quotamew",
  "/case-studies/quotamew/og",
  "/case-studies/quotamew.mdx",
  "/projects/quotamew/case-study",
  "/projects/quotamew/case-study/og",
  "/blog/quotamew",
  "/blog/quotamew/og",
  "/contents/case-studies/quotamew.mdx",
  "/src/contents/case-studies/quotamew.mdx",
]) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 404, path);
  assert.doesNotMatch(await response.text(), new RegExp(marker), path);
  console.log(`${path}: 404`);
}

for (const path of [
  "/",
  "/projects",
  "/projects/quotamew",
  "/blog",
  "/sitemap.xml",
]) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 200, path);
  const body = await response.text();
  assert.doesNotMatch(
    body,
    /CASE_STUDY_QUOTAMEW_INTERNAL_FIXTURE|trusted-local|case-studies\//,
    path,
  );
  if (path === "/projects/quotamew") {
    assert.match(
      body,
      /rel="canonical" href="https:\/\/yincheng\.app\/projects\/quotamew"/,
    );
    assert.match(
      body,
      /property="og:url" content="https:\/\/yincheng\.app\/projects\/quotamew"/,
    );
    assert.match(body, /https:\/\/yincheng\.app\/projects\/quotamew\/og/);
  }
}

console.log(
  "Case Study production-server privacy checks passed (local HTTP only)",
);
