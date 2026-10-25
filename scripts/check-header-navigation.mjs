import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

// Use an independently installed Playwright; no application dependency is needed.
const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.HEADER_PLAYWRIGHT_MODULE ?? "playwright",
);
const base = process.env.PROJECT_TEST_BASE_URL ?? "http://127.0.0.1:3000";
const out = resolve(
  process.env.HEADER_EVIDENCE_DIR ?? "/tmp/header-navigation",
);
const widths = [320, 360, 375, 390, 1280];
const routes = [
  "/",
  "/projects",
  "/projects/personal-website",
  "/projects/yinla-bot/case-study",
  "/projects/dpip/case-study",
  "/projects/personai-api/case-study",
  "/projects/quotamew/case-study",
  "/blog/first-post",
];
const headerSelector = ".sticky.top-0.z-40";
const results = [];
const runtime = [];
let currentCase = "setup";
mkdirSync(out, { recursive: true });
writeFileSync(`${out}/events.jsonl`, "");
function record(kind, data) {
  const event = {
    time: new Date().toISOString(),
    case: currentCase,
    kind,
    ...data,
  };
  appendFileSync(`${out}/events.jsonl`, `${JSON.stringify(event)}\n`);
  if (["console", "pageerror", "requestfailed", "http-error"].includes(kind)) {
    runtime.push(event);
  }
}
function observe(page) {
  page.on("console", (m) =>
    record("console", {
      type: m.type(),
      text: m.text(),
      location: m.location(),
    }),
  );
  page.on("pageerror", (e) => record("pageerror", { message: e.message }));
  page.on("request", (r) =>
    record("request", {
      url: r.url(),
      method: r.method(),
      rsc: r.headers().rsc ?? null,
    }),
  );
  page.on("response", (r) => {
    const data = {
      url: r.url(),
      status: r.status(),
      mime: r.headers()["content-type"],
    };
    record("response", data);
    if (r.status() >= 400) record("http-error", data);
  });
  page.on("requestfailed", (r) =>
    record("requestfailed", {
      url: r.url(),
      error: r.failure(),
      rsc: r.headers().rsc ?? null,
    }),
  );
}
async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.locator(`${headerSelector} a[href='/projects']:visible`).waitFor();
  // The existing page template fades in for 0.5s. Hit-testing alone also works
  // at opacity=0, so require the rendered header and its ancestors to be opaque.
  await page.waitForFunction((selector) => {
    let el = document.querySelector(selector);
    if (!el) return false;
    while (el) {
      const style = getComputedStyle(el);
      if (Number(style.opacity) < 0.999 || style.visibility !== "visible")
        return false;
      el = el.parentElement;
    }
    return true;
  }, headerSelector);
  // Assert that the actual icon graphics have loaded, including their shadow DOM.
  await page.waitForFunction(
    (selector) =>
      [...document.querySelectorAll(`${selector} iconify-icon`)]
        .filter((el) => el.getBoundingClientRect().width > 0)
        .every((el) => el.shadowRoot?.querySelector("svg")),
    headerSelector,
  );
}
async function open(page, route) {
  record("navigation.start", { route, method: "goto" });
  const response = await page.goto(new URL(route, base).href, {
    waitUntil: "domcontentloaded",
  });
  assert.equal(response.status(), 200, route);
  await settle(page);
}
async function destination(page, path) {
  await page.waitForURL((url) => url.pathname === path);
  await page.locator("main").first().waitFor();
  await page.waitForFunction(
    () => document.querySelector("main")?.innerText.trim().length > 30,
  );
  assert.equal(new URL(page.url()).pathname, path);
  if (path === "/projects")
    await page
      .getByText("我做的所有專案都在這裡展示", { exact: true })
      .waitFor();
  record("navigation.destination", { path, title: await page.title() });
}
async function geometry(page) {
  return page.locator(headerSelector).evaluate((header) => {
    const describe = (el) => {
      const r = el.getBoundingClientRect(),
        s = getComputedStyle(el);
      const hit = document.elementFromPoint(
        r.x + r.width / 2,
        r.y + r.height / 2,
      );
      const points = [
        [0.1, 0.1],
        [0.5, 0.1],
        [0.9, 0.1],
        [0.1, 0.5],
        [0.5, 0.5],
        [0.9, 0.5],
        [0.1, 0.9],
        [0.5, 0.9],
        [0.9, 0.9],
      ];
      return {
        tag: el.tagName,
        href: el.getAttribute("href"),
        role: el.getAttribute("role"),
        name: el.getAttribute("aria-label") ?? el.innerText?.trim(),
        rect: r.toJSON(),
        position: s.position,
        zIndex: s.zIndex,
        display: s.display,
        gap: s.gap,
        padding: s.padding,
        flexShrink: s.flexShrink,
        hitTag: hit?.tagName,
        hitHref: hit?.closest("a")?.getAttribute("href"),
        centerHit: hit === el || el.contains(hit),
        allPointsHit: points.every(([x, y]) => {
          const hit = document.elementFromPoint(
            r.x + r.width * x,
            r.y + r.height * y,
          );
          return hit === el || el.contains(hit);
        }),
        nestedInteractive: Boolean(
          el.parentElement.closest("a,button,[role=button]"),
        ),
      };
    };
    return {
      header: describe(header),
      targets: [...header.querySelectorAll("a,[aria-haspopup=menu]")]
        .filter((el) => el.getBoundingClientRect().width > 0)
        .map(describe),
      headings: [...header.querySelectorAll("h1")].map(describe),
      themeTabIndex: header.querySelector("[aria-haspopup=menu]")?.tabIndex,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      viewportWidth: innerWidth,
    };
  });
}
function checkGeometry(g) {
  assert.ok(
    g.scrollWidth <= g.viewportWidth && g.bodyScrollWidth <= g.viewportWidth,
    "viewport overflow",
  );
  const brand = g.targets.find((t) => t.href === "/");
  const projects = g.targets.find((t) => t.href === "/projects");
  assert.ok(brand && projects, "visible brand and Projects links");
  for (const t of g.targets) {
    assert.ok(t.name, `accessible name: ${t.href}`);
    assert.ok(
      t.rect.width >= 24 && t.rect.height >= 24,
      `minimum 24px target: ${t.href}`,
    );
    assert.ok(
      t.rect.left >= 0 && t.rect.right <= g.viewportWidth,
      "target within viewport",
    );
    assert.ok(
      t.centerHit && t.allPointsHit,
      `unobstructed target: ${t.href ?? t.name}`,
    );
    assert.ok(
      !t.nestedInteractive,
      `no nested interactive elements: ${t.href}`,
    );
  }
  for (let i = 0; i < g.targets.length; i++) {
    for (let j = i + 1; j < g.targets.length; j++) {
      const a = g.targets[i].rect,
        b = g.targets[j].rect;
      assert.ok(
        Math.min(a.right, b.right) <= Math.max(a.left, b.left) ||
          Math.min(a.bottom, b.bottom) <= Math.max(a.top, b.top),
        "non-overlapping interactive rectangles",
      );
    }
  }
}
async function keyboard(page, route, screenshot) {
  await open(page, route);
  const order = [];
  for (const expected of [
    "/",
    "/projects",
    "/blog",
    "/about",
    "https://www.threads.com/@_yincheng_",
    "https://www.instagram.com/_yincheng_",
    "https://github.com/YinCheng0106",
  ]) {
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => {
      const el = document.activeElement,
        s = getComputedStyle(el);
      return {
        href: el.getAttribute("href"),
        role: el.getAttribute("role"),
        name: el.getAttribute("aria-label") ?? el.textContent,
        visible: el.matches(":focus-visible"),
        outline: s.outlineStyle,
        outlineWidth: s.outlineWidth,
      };
    });
    assert.equal(focus.href, expected, "logical tab order");
    assert.ok(focus.visible, "visible keyboard focus");
    if (expected !== null)
      assert.ok(
        focus.outline !== "none" && parseFloat(focus.outlineWidth) >= 2,
        "visible link outline",
      );

    order.push(focus);
  }
  for (const [tabs, path] of [
    [1, "/"],
    [2, "/projects"],
  ]) {
    await open(page, route);
    for (let i = 0; i < tabs; i++) await page.keyboard.press("Tab");
    if (tabs === 2) await page.screenshot({ path: screenshot });
    await page.keyboard.press("Enter");
    await destination(page, path);
  }
  return order;
}
const browser = await chromium.launch({ headless: true });
let failed;
try {
  for (const theme of ["light", "dark"]) {
    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height: 960 },
        colorScheme: theme,
      });
      const page = await context.newPage();
      observe(page);
      try {
        for (const route of routes) {
          currentCase = `${theme}-${width}-${route}`;
          const slug = `${theme}-${width}-${route.replaceAll("/", "_") || "home"}`;
          await open(page, route);
          assert.equal(await page.locator("html").getAttribute("class"), theme);
          const g = await geometry(page);
          record("geometry", g);
          checkGeometry(g);
          await page.screenshot({ path: `${out}/${slug}.png` });
          if (route.includes("/case-study"))
            assert.equal(await page.locator("article h1").count(), 1);
          for (const path of ["/projects", "/"]) {
            if (path === "/") await open(page, route);
            record("navigation.start", {
              route,
              method: "click",
              target: path,
            });
            await page
              .locator(`${headerSelector} a[href='${path}']:visible`)
              .click();
            await destination(page, path);
          }
          let tabOrder;
          if (width === 320)
            tabOrder = await keyboard(page, route, `${out}/${slug}-focus.png`);
          results.push({
            theme,
            width,
            route,
            geometry: g,
            tabOrder,
            passed: true,
          });
          console.log(`PASS ${currentCase}`);
        }
      } finally {
        await context.close();
      }
    }
    const touch = await browser.newContext({
      viewport: { width: 320, height: 960 },
      colorScheme: theme,
      hasTouch: true,
      isMobile: true,
    });
    const page = await touch.newPage();
    observe(page);
    try {
      for (const route of routes) {
        currentCase = `${theme}-320-touch-${route}`;
        for (const path of ["/projects", "/"]) {
          await open(page, route);
          checkGeometry(await geometry(page));
          record("navigation.start", { route, method: "tap", target: path });
          await page
            .locator(`${headerSelector} a[href='${path}']:visible`)
            .tap();
          await destination(page, path);
        }
        results.push({ theme, width: 320, route, touch: true, passed: true });
        console.log(`PASS ${currentCase}`);
      }
    } finally {
      await touch.close();
    }
  }
  // Confirm the other internal navigation links use the real destinations too.
  const context = await browser.newContext({
    viewport: { width: 320, height: 960 },
  });
  const page = await context.newPage();
  observe(page);
  for (const path of ["/blog", "/about"]) {
    currentCase = `additional-link-${path}`;
    await open(page, "/projects/yinla-bot/case-study");
    await page.locator(`${headerSelector} a[href='${path}']:visible`).click();
    await destination(page, path);
  }
  await context.close();
} catch (error) {
  failed = { case: currentCase, message: error.stack };
  console.error(error);
} finally {
  await browser.close();
  // Retain every console and network event. Local platform-script 404s are a
  // documented environment limitation, never a blanket console/network filter.
  const local = ["127.0.0.1", "localhost"].includes(new URL(base).hostname);
  const platform404 = (url) =>
    local &&
    [
      "/_vercel/insights/script.js",
      "/_vercel/speed-insights/script.js",
    ].includes(new URL(url).pathname);
  const unexpected = runtime.filter(
    (e) =>
      e.kind === "pageerror" ||
      (e.kind === "http-error" && !(e.status === 404 && platform404(e.url))) ||
      (e.kind === "console" &&
        e.type === "error" &&
        !(platform404(e.location.url) && e.text.includes("404"))) ||
      (e.kind === "requestfailed" &&
        !(
          platform404(e.url) ||
          (e.rsc === "1" && e.error?.errorText === "net::ERR_ABORTED")
        )),
  );
  writeFileSync(
    `${out}/results.json`,
    JSON.stringify(
      {
        base,
        browser: browser.version(),
        results,
        failed,
        runtime,
        unexpected,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        cases: results.length,
        failed,
        unexpectedRuntimeEvents: unexpected.length,
        evidence: out,
      },
      null,
      2,
    ),
  );
  if (failed || unexpected.length) process.exitCode = 1;
}
