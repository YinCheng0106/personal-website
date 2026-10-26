import { expect, test } from "bun:test";
import { renderToReadableStream } from "react-dom/server";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { MDXComponents } from "@/components/mdx/mdx-components";
import { rehypeBlogHeadings } from "@/lib/rehype-blog-headings";
import { getPostBySlug, type Heading } from "@/lib/posts";

async function render(source: string, title = "Article title") {
  const headings: Heading[] = [];
  const { content } = await compileMDX({
    source,
    components: MDXComponents(),
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypeBlogHeadings, { title, headings }]],
      },
    },
  });
  const stream = await renderToReadableStream(
    <article>
      <header>
        <h1>{title}</h1>
      </header>
      <section>{content}</section>
    </article>,
  );
  await stream.allReady;
  const html = await new Response(stream).text();
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  return { html, headings };
}

test.each(["# Article title", "# **Article title**", "# {frontmatter.title}"])(
  "only treats the leading decorative title as prose: %s",
  async (title) => {
    const { html, headings } = await render(
      `${title}\n\n## Section\n\n### Detail`,
    );
    expect(html).toMatch(
      /<p id="[^"]*" class="group my-4 text-4xl font-bold">/,
    );
    expect(html).toMatch(/<h2 id="section"[^>]*>Section/);
    expect(html).toMatch(/<h3 id="detail"[^>]*>Detail/);
    expect(html).toContain('href="#section"');
    expect(headings).toEqual([
      { depth: 2, text: "Section", slug: "section" },
      { depth: 3, text: "Detail", slug: "detail" },
    ]);
  },
);

test("embeds meaningful H1 sections and their children without discarding semantics or typography", async () => {
  const { html, headings } = await render(
    "# Setup\n\n[Setup](#setup) [Child](#setup-1)\n\n## Setup\n\n### Details\n\n# Setup",
  );
  expect(html).toMatch(
    /<h2 id="setup" class="group my-4 text-4xl font-bold">Setup/,
  );
  expect(html).toMatch(
    /<h3 id="setup-1" class="group my-4 text-3xl font-bold">Setup/,
  );
  expect(html).toMatch(
    /<h4 id="details" class="group my-4 text-2xl font-bold">Details/,
  );
  expect(html).toMatch(/<h2 id="setup-2"/);
  expect(html).toContain('href="#setup-1"');
  expect(headings).toEqual([
    { depth: 2, text: "Setup", slug: "setup" },
    { depth: 3, text: "Setup", slug: "setup-1" },
    { depth: 2, text: "Setup", slug: "setup-2" },
  ]);
});

test("does not discard later H1s even if they match the article title", async () => {
  const { html } = await render(
    "# Article title\n\n## Intro\n\n# Article title",
  );
  expect(html).toMatch(/<h2 id="article-title-1"/);
  expect(html).toMatch(/<h3 id="intro"/);
});

test("retains static heading text around expressions without enabling JavaScript", async () => {
  const { html, headings } = await render(
    "# Dynamic {21 * 2} section\n\n## Child",
  );
  expect(html.replaceAll("<!-- -->", "")).toMatch(
    /<h2 id="dynamic--section"[^>]*>Dynamic  section/,
  );
  expect(html).not.toContain("42");
  expect(html).toMatch(/<h3 id="child"/);
  expect(headings).toEqual([
    { depth: 2, text: "Dynamic  section", slug: "dynamic--section" },
    { depth: 3, text: "Child", slug: "child" },
  ]);
});

test("preserves empty title IDs and H2-first documents", async () => {
  const { html, headings } = await render("# \n\n## Section\n\n### Detail");
  expect(html).toContain('<p id="" class="group my-4 text-4xl font-bold"></p>');
  expect(headings.map(({ depth }) => depth)).toEqual([2, 3]);
  const h2First = await render("## Section\n\n### Detail");
  expect(h2First.html).toMatch(/<h2 id="section"/);
  expect((await render("Just prose.")).headings).toEqual([]);
});

test("retains level seven semantics at the native heading limit", async () => {
  const { html } = await render("# Root\n\n##### Fifth\n\n###### Sixth");
  expect(html).toMatch(/<h6 id="fifth" class="group my-4 text-lg font-bold">/);
  expect(html).toMatch(
    /<h6 id="sixth" aria-level="7" class="group my-4 text-base font-bold">/,
  );
});

test("renders the unchanged published article with nine functional TOC targets", async () => {
  const post = getPostBySlug("first-post")!;
  const { html, headings } = await render(post.content, post.title);
  expect(headings).toHaveLength(9);
  for (const { slug } of headings) {
    expect(html).toContain(`id="${slug}"`);
    expect(html).toContain(`href="#${slug}"`);
  }
});
