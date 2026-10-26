import type { Element, Root, RootContent } from "hast";
import { embedHeadings, headingElements } from "@/lib/embedded-headings";
import type { Heading } from "@/lib/posts";

function text(node: RootContent): string {
  if (node.type === "text") return node.value;
  return "children" in node ? node.children.map(text).join("") : "";
}

function isStatic(node: RootContent): boolean {
  return (
    node.type === "text" ||
    (node.type === "element" &&
      node.tagName !== "img" &&
      node.children.every(isStatic))
  );
}

function isDisplayTitle(heading: Element, title: string): boolean {
  // The compiler's existing blockJS default removes expressions (including the
  // legacy frontmatter.title display). Inspect only the remaining static text.
  if (!heading.children.every(isStatic)) return false;
  const value = text(heading).trim();
  return !value || value === title.trim();
}

export function rehypeBlogHeadings({
  title,
  headings,
}: {
  title: string;
  headings: Heading[];
}) {
  return (tree: Root) => {
    const first = tree.children.find(
      (node) => node.type !== "text" || node.value.trim(),
    );
    // Only a leading empty/duplicate title is decorative. Later H1 sections
    // retain heading semantics, even when they repeat the article title.
    if (
      first?.type === "element" &&
      first.tagName === "h1" &&
      isDisplayTitle(first, title)
    ) {
      first.tagName = "p";
      first.properties.dataArticleTitle = true;
    }
    // Initial H2/H3 sections already belong to the canonical article title.
    // Only independent H1 sections and their descendants need the offset.
    embedHeadings(tree, { preservePreamble: true });
    // Build the TOC from the same slugged, embedded tree that will be rendered.
    // This also includes meaningful H1 sections now rendered as H2.
    for (const heading of headingElements(tree)) {
      const depth = Number(heading.tagName[1]);
      const value = text(heading).trim();
      if ((depth === 2 || depth === 3) && value && heading.properties.id) {
        headings.push({
          depth,
          text: value,
          slug: String(heading.properties.id),
        });
      }
    }
  };
}
