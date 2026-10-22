# Trusted Case Study content foundation

## Ownership and trust boundary

Project v2 remains the only source of product identity, stable ID, route slug,
title, summary, attribution, repositories, publication status and project SEO.
No Project v2 schema or data changes are needed. MDX contains body content only,
without frontmatter. `caseStudy.href` is not a content path or an approval signal.

`src/lib/case-studies.ts` is server-only. Its private registry explicitly maps
`ProjectV2.id` to a literal local file reader and article approval. It accepts
neither source text nor paths, URLs, repository names or dynamic import targets.
Unknown IDs, inherited object keys and traversal strings return unavailable.
Only code-reviewed, repository-local MDX may reach its private compiler. MDX is
executable trusted code; this is not an untrusted-content sandbox.

The existing blog loader, renderer and draft policy are independent and unchanged.
The GitHub README renderer still uses `react-markdown`, `remark-gfm`, `skipHtml`
and its safe URL transform. Never send remote README text into this loader or
the blog MDX compiler.

## APIs and publication

- `getCaseStudyAvailability(id)` reports local nonempty file availability and
  publication eligibility. Availability does not imply valid MDX or approval.
- `validateCaseStudyContent(id)` compiles allowlisted content for internal
  authoring validation and returns only `missing`, `invalid` or `valid`. It
  deliberately exposes neither draft source nor its render tree. JavaScript
  expressions and MDX imports stay disabled using the existing compiler options.
  Compilation alone cannot prove arbitrary MDX runtime/component behavior. The
  approved article is also rendered in the unit tests.
- `getPublicCaseStudy(id)` checks the canonical product's `published` status
  AND the registry's explicit `approved` article status before any read or
  compilation. It returns the original Project v2 record plus a render tree, or
  `null` on missing/empty/unreadable/malformed content. It has no preview flag,
  environment bypass or approval override. Error messages and paths are not
  exposed. The current approved article is verified through actual SSR rendering.

Unlisted products keep their existing direct project-page access and noindex
policy; their Case Studies are conservatively ineligible, as are draft/private
products. Diagnostic APIs are internal exports, not HTTP APIs or Server Actions.

## QuotaMew publication candidate (Phase 2-C3b-1)

Only `quotamew` is allowlisted and explicitly `approved`. Its source is the
user-supplied Traditional Chinese v1.1 article, with Markdown headings, paragraph
breaks, lists and the supplied memory table restored. There is no frontmatter,
new media, duplicate product record or synthetic fixture content. First-person
experience, AI assistance, experimental Claude Code limitations, Apple Developer
Program limitations and the approximate 12 MB / 50 MB observations remain intact.
This is a reviewed publication candidate in code, not an announcement of deployment.

`/projects/[slug]/case-study` resolves the canonical product using Project v2,
then looks up repository-local content by its stable ID. Only QuotaMew currently
returns an article. Missing, unreadable, empty or invalid content returns 404;
other IDs and project visibility states are ineligible. No preview bypass exists.
The page uses the Node runtime with `force-dynamic`, so its local MDX is read and
compiled on the server at request time. Current article Markdown is compiled and
rendered in tests; changes to executable MDX or custom components require renewed
code review and render verification, not merely a successful compilation.

The article H1 supplies its metadata title; description combines the canonical
Project v2 summary with the article's opening paragraph. Canonical, Open Graph
(type `article`) and Twitter metadata use the article URL and the existing product
OG image. Product metadata definitions stay unchanged. The product page adds only
a gated text link; sitemap includes only articles accepted by the same public
loader at build time. Rebuild the immutable release package after any article,
approval or product-visibility change; the sitemap remains prerendered.

Article layout reuses the existing `prose`, `dark:prose-invert` and site tokens,
with one article H1, H2 sections, readable spacing and a keyboard-focusable,
horizontally scrollable table region. Global navigation, cards, blog components,
GitHub README rendering and project attribution are unchanged.

## Runtime packaging

`next.config.mjs` explicitly traces the literal QuotaMew MDX for project pages,
Case Study pages and sitemap. The build artifact checker verifies the article and
project page `.nft.json` entries and byte equality of the standalone MDX copy.
The source is server-only and is never served as a raw public asset. See
[Next.js output tracing](https://nextjs.org/docs/app/api-reference/config/next-config-js/output).
For standalone verification, copy `public` and `.next/static` into the generated
standalone package and run `node server.js` from the relocated package. Do not
infer runtime success from source-checkout file presence or a unit test alone.
Vercel project settings are not modified; a reviewed deployment requires separate
acceptance in its actual environment.

## Future publication procedure

1. Review the article and any future media, keeping product metadata in Project v2.
2. Review the literal ID mapping and explicitly approve only that article in code.
3. Resolve slugs through Project v2 and use the stable ID for local lookup.
4. Apply the same gate to page rendering, metadata, links and sitemap discovery.
5. Rebuild and verify tests, raw-source/client artifact boundaries, file tracing,
   production HTTP behavior and the relocated standalone runtime.
6. Obtain separate reviewed PR and deployment authorization. No commit, push,
   merge or deployment is part of Phase 2-C3b-1 implementation.

## Validation commands

```sh
bun test
bun run lint
bun x tsc --noEmit
bun run build
bun scripts/check-case-study-artifacts.ts
git diff --check
```

With a local production server running, use the same base URL for both checks:

```sh
PROJECT_TEST_BASE_URL=http://127.0.0.1:3000 bun scripts/check-yinla-routes.ts
PROJECT_TEST_BASE_URL=http://127.0.0.1:3000 bun scripts/check-case-study-routes.ts
```

The artifact scan requires a completed build and nonempty client/public-output
populations. It rejects fixture markers and selected credential/machine-path
patterns. This is bounded evidence, not a comprehensive secret detector. Local
HTTP checks are distinct from unit tests and actual deployment verification;
no production deployment is authorized in this phase.

## Historical Phase 2-C3a verification — 2026-10-22

- Baseline: remote `main` and worktree HEAD both verified as
  `8c0f36b23f1fcd6178dea4a6ca2495d82821c155`. Phase 2-B2 is merged as PR #5.
  Branch: `feat/case-study-content-foundation`; changes remain uncommitted.
- Dependencies: frozen-lockfile install; no dependency, manifest or lock changes.
- Unit tests: 54 passed, 0 failed across 5 files. The expected network-error test
  prints a simulated error and passes. Local MDX compilation/rendering and remote
  README payloads are separate fixture evidence, not live GitHub acceptance.
- ESLint: 0 errors, 3 existing warnings in `not-found.tsx`,
  `mdx-components.tsx`, and `circularText.tsx`. TypeScript and the Next.js 16.0.7
  production build both passed. `git diff --check` passed.
- Public artifacts: 160 client files and 176 prerendered public documents passed
  the fixture-marker and selected sensitive-pattern checks. No Case Study route
  exists in the build manifest; the two YINLA redirects remain 308.
- Local HTTP: both route scripts passed first on `next start`, then on the built
  standalone Node server with its public/static assets. All six project routes,
  homepage, project listing and sitemap return 200. Legacy YINLA page/OG routes
  redirect 308, including query preservation and trailing-slash handling; its
  canonical OG returns PNG 200. Ten guessed article/OG/source URLs return 404.
  QuotaMew's project canonical/OG metadata remains the existing product metadata.
- Diagnostic limitation: unknown blog slugs log Next's internal
  `NoFallbackError` while returning the expected production 404. Both
  `/blog/quotamew` and an unrelated unknown control slug reproduce this behavior;
  the response contains no internal error/path or pilot marker. Blog code and
  configuration match baseline byte-for-byte. No separate fresh baseline build
  was run, so attributing this log to existing framework behavior is an inference.
  Blog behavior is outside this change's scope.
- Original checkout preservation: 101 tracked/untracked files matched the
  preflight content/metadata/xattr snapshot; index hash, HEAD, branch, status and
  stash list also matched. Fetch only advanced the shared remote-tracking ref;
  the original local branch was not switched or advanced.
- Deployment evidence: none. No commit, push, PR, merge or deployment was made.
  Actual article approval, future public route integration and deployment/runtime
  packaging acceptance remain separate work. This foundation is ready for PR
  preparation only, with no article publication approved.


## Phase 2-C3b-1 verification — 2026-10-23

- Base: fetched `origin/main`, verified against `git ls-remote` as
  `9d1c8b2b115662f6dd9f4871fdd827be1bbcb441` (C3a merged in PR #6).
  Branch: `feat/quotamew-case-study` in the new managed worktree at
  `/Users/yincheng/.codex/worktrees/quotamew-case-study/personal-website`.
- Article: the user's full v1.1 supplied in this session, formatted as Markdown
  without rewriting prose. The flattened memory table was restored to two data
  rows. No media, product-record, attribution or dependency changes.
- Unit tests: 56 passed, 0 failed, 466 assertions across 5 files. The simulated
  network-error test logs its expected exception and passes. ESLint: 0 errors,
  3 pre-existing warnings in `not-found.tsx`, `mdx-components.tsx`, and
  `circularText.tsx`. TypeScript, Next.js production build and diff whitespace
  check passed. The final test-only/type and documentation edits did not alter
  runtime code after the successful build.
- Build: dynamic Node SSR article route confirmed in the build manifest;
  both article and product page traces include the literal local MDX. The
  standalone MDX matches source bytes. Artifact scan passed across 160 client
  files and 176 public documents; no fixture marker, selected sensitive pattern,
  article source text in client bundles or internal MDX source path was found.
- HTTP: both `next start` on port 3211 and a standalone package relocated outside
  the checkout on port 3212 passed both route scripts. Article is 200 with the
  approved first-person text, table, canonical, OG and Twitter tags. Eighteen
  alternate/other-product/source/preview guesses return 404 without article
  content. Six product pages, home, project index, blog and sitemap are 200.
  Sitemap contains exactly one Case Study. YINLA page/OG legacy URLs remain
  308, preserving query strings; canonical OG is PNG 200.
- Failure controls: a Node fetch preloader outside the repository returned 503
  for GitHub requests, recording 2 standard-server and 8 standalone positive
  controls at the verification checkpoint. Article requests on both servers
  still rendered complete content with zero additional GitHub fetches. This
  is a deliberately injected outage over real local HTTP, not live GitHub
  availability or production evidence.
- Missing-content control: temporarily removed only the relocated package's
  MDX. Article returned 404 without source/path disclosure; the product page
  omitted its article link. Restored the package bytes and rechecked 200.
  The original source/worktree article was not changed by this control.
- Presentation: desktop light/dark browser inspection completed at 1280px,
  including the table and its qualifications. Table uses a named, focusable
  horizontal-scroll region. No phone device/browser viewport run was performed.
  QA screenshots are outside the repository under the task-observer evidence
  directory; they are not published article media.
- Original checkout: 101 file hashes plus raw index hash, HEAD, branch, full
  status and stash list match the preflight snapshot. New branch HEAD still
  equals the base; the index is empty and all 13 implementation files remain
  uncommitted. No push, PR, merge, deployment or Vercel setting change.
- Limitations: `next start` prints the framework's existing standalone-output
  warning; the supported standalone entry point was verified separately.
  Unknown blog URLs log `NoFallbackError` while returning the expected 404;
  blog sources match base and were not repaired in this scope. Sitemap is a
  build-time artifact, so content/approval changes require a fresh build.
  Actual Vercel packaging/runtime and phone-device acceptance remain unverified.
- Verdict: **READY FOR PR PREPARATION**. This candidate is not publicly deployed;
  a separate reviewed PR and release remain required.


### Changed files (13)

- `docs/case-study-content.md` — trust contract and verification evidence.
- `next.config.mjs` — literal MDX runtime tracing.
- `scripts/check-case-study-artifacts.ts` — manifest, bundle and packaging checks.
- `scripts/check-case-study-routes.ts` — approved article and privacy HTTP checks.
- `scripts/check-yinla-routes.ts` — count canonical product URLs independently of articles.
- `src/app/(main)/projects/[slug]/case-study/page.tsx` — new gated SSR route and metadata.
- `src/app/(main)/projects/[slug]/page.tsx` — gated article text link.
- `src/app/sitemap.ts` — approved, available Case Study discovery.
- `src/components/mdx/case-study-components.tsx` — article links and scrollable table.
- `src/contents/case-studies/quotamew.mdx` — approved v1.1 content.
- `src/lib/case-studies.ts` — explicit approval and shared public lookup.
- `src/lib/case-studies.test.tsx` — article, gates, metadata and discovery regressions.
- `src/lib/project-metadata.test.ts` — async sitemap and server-only module test setup.


## Phase 2-C3b-2 final local review — 2026-10-23

- Existing isolated worktree and feature branch verified at the expected base
  `9d1c8b2b115662f6dd9f4871fdd827be1bbcb441`; fetched `origin/main` is identical.
  Phase 2-C3a is present as merged PR #6. All 13 changed files, including the two
  untracked implementation files, were reviewed. No runtime or editorial fix
  was required by the final review.
- Retrieved the user's actual approved v1.1 from the previous implementation
  conversation. The article matches after normalizing Markdown headings,
  whitespace and table delimiters. No prose, claims, links or media were added.
- Fresh tests: 56 passed, 0 failed, 466 assertions in 5 files. Lint: 0 errors
  and the same 3 existing warnings. `bun x tsc --noEmit`, `bun run build` and
  `git diff --check` passed. Artifact checks passed for 160 client files and
  176 public documents, including literal MDX traces and standalone byte equality.
- Both established route suites passed on standard Next production (port 3221)
  and the standalone package copied outside the repository (port 3222), covering
  the complete article, six canonical products, sitemap, metadata, raw-source
  exclusions, unavailable articles and YINLA 308 redirects.
- Fresh injected GitHub 503 controls passed on both production entry points:
  each recorded a blocked GitHub request from a product-page positive control;
  the complete article then rendered 200 without additional GitHub requests.
  Cached GitHub responses were moved aside within generated verification
  artifacts to ensure the outage control actually reached the injected boundary.
- Missing and malformed MDX controls modified only the relocated package:
  both returned 404, hid the project-to-article link and disclosed no source path.
  Original package bytes were restored and article 200 was rechecked.
- Vercel Preview SHA, deployed runtime, logs and responsive visual acceptance
  are release-stage checks recorded in the PR and final acceptance report,
  separate from these local results. No merge or Production deployment is
  authorized by this review.
