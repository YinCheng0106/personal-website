import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";

async function filesUnder(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

// Require a real completed build and nonempty populations: no vacuous scan pass.
assert.ok((await readFile(".next/BUILD_ID", "utf8")).trim());
const clientFiles = await filesUnder(".next/static");
const publicDocuments = (await filesUnder(".next/server/app")).filter((path) =>
  /\.(?:html|rsc|body|meta|txt|xml)$/.test(path),
);
assert.ok(clientFiles.length > 0, "missing client build artifacts");
assert.ok(publicDocuments.length > 0, "missing prerendered public documents");

for (const file of [...clientFiles, ...publicDocuments]) {
  const source = await readFile(file, "utf8");
  assert.doesNotMatch(
    source,
    /CASE_STUDY_[A-Z0-9_]+_INTERNAL_FIXTURE|data-case-study-fixture|This synthetic fixture checks the local content pipeline/,
    `internal content leaked into ${file}`,
  );
  assert.doesNotMatch(
    source,
    /(?:\/Users\/|\/home\/)[A-Za-z0-9_.-]+\/|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|ghp_[A-Za-z0-9]{36}/,
    `sensitive pattern in ${file}`,
  );
}

const appPaths = JSON.parse(
  await readFile(".next/server/app-paths-manifest.json", "utf8"),
);
assert.ok(Object.keys(appPaths).length > 0);
assert.equal(
  Object.keys(appPaths).some((path) => /case-stud/.test(path)),
  true,
);

// The article must be packaged for actual request-time fs reads, not merely
// present in the source checkout. Next trace paths are relative to each trace.
const contentPaths = [
  "src/contents/case-studies/quotamew.mdx",
  "src/contents/case-studies/dpip.mdx",
  "src/contents/case-studies/personai-api.mdx",
];
for (const contentPath of contentPaths) {
  for (const tracePath of [
    ".next/server/app/(main)/projects/[slug]/page.js.nft.json",
    ".next/server/app/(main)/projects/[slug]/case-study/page.js.nft.json",
    ".next/server/app/sitemap.xml/route.js.nft.json",
  ]) {
    const trace = JSON.parse(await readFile(tracePath, "utf8"));
    assert.ok(
      trace.files.some(
        (file: string) =>
          resolve(dirname(tracePath), file) === resolve(contentPath),
      ),
      tracePath,
    );
    const tracedArticles = trace.files
      .map((file: string) => resolve(dirname(tracePath), file))
      .filter(
        (file: string) =>
          file.includes("/src/contents/case-studies/") && file.endsWith(".mdx"),
      );
    assert.deepEqual(
      tracedArticles.sort(),
      contentPaths.map((path) => resolve(path)).sort(),
    );
  }
  assert.deepEqual(
    await readFile(`.next/standalone/${contentPath}`),
    await readFile(contentPath),
  );
}
assert.deepEqual(
  (await filesUnder(".next/standalone/src/contents/case-studies")).sort(),
  contentPaths.map((path) => `.next/standalone/${path}`).sort(),
  "standalone must contain exactly the three allowlisted articles",
);
for (const file of clientFiles) {
  assert.doesNotMatch(
    await readFile(file, "utf8"),
    /其實一開始，我沒有特別打算要開發 macOS App|這個功能是我自己提出來的。|其實當初在決定畢業專題題目的時候|坐在椅子上，竟然也被判斷成深蹲|src\/contents\/case-studies/,
  );
}

const routes = JSON.parse(await readFile(".next/routes-manifest.json", "utf8"));
for (const suffix of ["", "/og"]) {
  const redirect = routes.redirects.find(
    (route: { source: string }) =>
      route.source === `/projects/yinla-bot-website${suffix}`,
  );
  assert.equal(redirect?.destination, `/projects/yinla-bot${suffix}`);
  assert.equal(redirect?.statusCode, 308);
}

console.log(
  `Public artifact checks passed: ${clientFiles.length} client files, ${publicDocuments.length} public documents`,
);
