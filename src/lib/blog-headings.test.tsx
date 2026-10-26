import { expect, test } from "bun:test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MDXComponents } from "@/components/mdx/mdx-components";

test("keeps the article header as the sole H1 while retaining MDX title text and section anchors", () => {
  const components = MDXComponents({});
  const heading = (tag: "h1" | "h2" | "h3", text: string) =>
    createElement(components[tag] as ComponentType<{ id: string; children?: string }>, {
      id: tag,
    }, text);
  const html = renderToStaticMarkup(
    <article>
      <header><h1>Article title</h1></header>
      <section>{heading("h1", "MDX display title")}{heading("h2", "Section")}{heading("h3", "Detail")}</section>
    </article>,
  );
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  expect(html).toContain('id="h1"');
  expect(html).toContain("MDX display title</p>");
  expect(html).toMatch(/<h2 id="h2"[^>]*>Section/);
  expect(html).toMatch(/<h3 id="h3"[^>]*>Detail/);
  expect(html).toContain('href="#h2"');
});
