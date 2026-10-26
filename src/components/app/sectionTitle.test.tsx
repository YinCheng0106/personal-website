import { describe, expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

// Next supplies these generated font classes in the application build.
mock.module("@/app/fonts", () => ({
  notoSerifTC: { className: "test-serif" },
  playfairDisplay: { className: "test-display" },
}));

const { SectionTitle } = await import("./sectionTitle");
const { ProjectBlock } = await import("./projectBlock");

describe("page and section heading contracts", () => {
  test("defaults to H2 and allows an explicit page H1 with identical styling", () => {
    const section = renderToStaticMarkup(<SectionTitle title="專案" subtitle="描述" />);
    const page = renderToStaticMarkup(<SectionTitle as="h1" title="專案" subtitle="描述" />);
    expect(section).toMatch(/<h2\b[^>]*>專案<\/h2>/);
    expect(page).toMatch(/<h1\b[^>]*>專案<\/h1>/);
    expect(page.replaceAll("h1", "h2")).toBe(section);
  });

  test("uses H2 cards under page titles and keeps H3 cards under homepage sections", () => {
    const props = { type: "Website", title: "Example", description: "Description", link: "/projects/example" };
    const section = renderToStaticMarkup(<ProjectBlock {...props} />);
    const page = renderToStaticMarkup(<ProjectBlock {...props} headingAs="h2" />);
    expect(section).toMatch(/<h3\b[^>]*>Example<\/h3>/);
    expect(page).toMatch(/<h2\b[^>]*>Example<\/h2>/);
    expect(page.replaceAll("h2", "h3")).toBe(section);
  });
});
