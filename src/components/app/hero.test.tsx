import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("@/app/fonts", () => ({
  notoSerifTC: { className: "test-serif" },
  playfairDisplay: { className: "test-display" },
}));

const { Hero } = await import("./hero");

test("renders a complete slogan and navigation without a browser media preference", () => {
  // SSR cannot know the media preference. CSS can expose this complete
  // fallback before hydration, while the typewriter remains unmounted.
  const html = renderToStaticMarkup(<Hero />);
  expect(html).toContain("每一個專案，都是我成長的足跡");
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  expect(html).toContain("YinCheng");
  expect(html).toMatch(/href="#projects"[^>]*>我的專案<\/a>/);
  expect(html).toMatch(/href="\/about"[^>]*>關於我<\/a>/);
  expect(html).toContain('aria-label="前往我的專案"');
  expect(renderToStaticMarkup(<Hero />)).toBe(html);
});
