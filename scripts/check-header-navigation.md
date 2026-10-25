# Header navigation regression

Run against a production-mode Next.js server or the exact Vercel Preview URL.
The script uses Chromium through a separately installed Playwright, so it does
not add a browser-testing dependency to the application or change its lockfile.

```sh
bun run build
bun run start --port 3000
# In another terminal, with Playwright and Chromium installed:
PROJECT_TEST_BASE_URL=http://127.0.0.1:3000 \
HEADER_EVIDENCE_DIR=/tmp/header-navigation \
node scripts/check-header-navigation.mjs
```

If Playwright is installed outside this checkout, set `HEADER_PLAYWRIGHT_MODULE`
to the absolute path of its package directory. Keep evidence outside the repo.
Use a fresh evidence directory for each run. No header mocks, forced clicks,
request interception, or programmatic location changes replace user actions.

The representative project detail is `/projects/personal-website`. Additional
fully rendered detail-page probes found existing metadata/README-content overflow
on other details (DPIP, QuotaMew, YINLA, ISO Countries Utils). Their header boxes
still fit 320px; these content defects are recorded separately and are outside
this header patch. The viewport-overflow assertion is not relaxed for the eight
routes in the required matrix.

Coverage: eight routes × five widths (320, 360, 375, 390, 1280) × light/dark =
80 pointer cases, plus 16 touchscreen cases at 320px. Each pointer case checks
actual loaded icon graphics, link names, nine hit-test points per target,
non-overlapping interactive rectangles, minimum 24px target dimensions,
viewport overflow, and normal brand/Projects clicks. At 320px, all eight routes
also check the entire header tab order, visible link focus, and Enter navigation
to both destinations. Touch cases tap both actual links. The remaining two
internal header destinations, Blog and About, also receive normal clicks.

All tested routes share this header. Below 768px it presents Projects, Blog,
and About as labeled icon links; desktop presents those three links as text.
Threads, Instagram, GitHub, and the theme control remain visible at every width.
The brand is YC on mobile and YinCheng on desktop. The 375px breakpoint is
content-driven: 31px brand + 8px separation + 272px controls + 64px padding
needs about 375px. Below it, 32px total padding and 8px control gaps fit 320px. Existing brand H1 markup is
preserved. The existing theme trigger is a div without a button role and has tabIndex=-1;
it is skipped in keyboard order. This separate pre-existing accessibility defect
is recorded in geometry and is not changed by the navigation-layout hotfix.

`events.jsonl` retains console messages, page errors, requests, responses,
request failures, geometry, and navigation boundaries without suppressing logs.
`results.json` and screenshots provide the review evidence. Local 404s for the
two Vercel telemetry scripts are classified as a platform limitation; Preview
must load them successfully. Canceled RSC prefetches are recorded separately
from HTTP errors and page errors and require review of the raw navigation events.
No telemetry ingestion or physical-device acceptance is claimed.

The unfixed production build is a negative control: the brand anchor has a zero
rectangle, and the 320px Projects center hits the fixed YC heading. The geometry
assertion fails before the normal-click suite can pass.
