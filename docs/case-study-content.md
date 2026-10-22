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
  pilot's static JSX is also rendered in the unit tests.
- `getPublicCaseStudy(id)` checks the canonical product's `published` status
  AND the registry's explicit `approved` article status before any read or
  compilation. It returns the original Project v2 record plus a render tree, or
  `null` on missing/empty/unreadable/malformed content. It has no preview flag,
  environment bypass or approval override. Error messages and paths are not
  exposed. Future rendering code must also handle MDX runtime errors.

Unlisted products keep their existing direct project-page access and noindex
policy; their Case Studies are conservatively ineligible, as are draft/private
products. This implementation creates no Case Study page, API, preview endpoint,
OG route, navigation link, metadata entry or sitemap entry in any environment.
The diagnostic APIs are internal module exports, not HTTP APIs or Server Actions.

## QuotaMew pilot

Only `quotamew` is allowlisted. Its article approval is explicitly `draft`.
The local MDX is a synthetic pipeline fixture, not the Phase 2-C2 editorial draft.
It contains no account information, quota values, personal paths, screenshots,
feature assertions or release claims. Real editorial drafts are not imported.
Local validation succeeds independently of GitHub. Public lookup returns `null`
even though the QuotaMew product itself is published. Other projects continue to
work without articles, media, or any particular repository count.

## Future publication procedure

1. Review the actual article and media, keeping product metadata in Project v2.
2. Review the literal registry mapping and explicitly approve that article in code.
3. In a separate reviewed change, integrate `getPublicCaseStudy` into a server
   page. Resolve route slugs through Project v2, then look up content by its ID.
   Return 404 on `null`, and derive metadata only after that same gate succeeds.
4. Apply the same gate to any links, static params, OG routes and sitemap entries.
   Do not serialize diagnostic results or draft content into client props.
5. Recheck draft/private/unlisted behavior, guessed URLs, error handling, client
   artifacts, and runtime/deployment file tracing. No route integration or actual
   approval is part of this phase; standalone packaging of a future reader still
   needs its own runtime verification.

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

## Phase 2-C3a verification — 2026-10-22

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
