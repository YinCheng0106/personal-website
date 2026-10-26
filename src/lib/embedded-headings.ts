import type { Element, Root } from "hast";

export function headingElements(tree: Root): Element[] {
  const headings: Element[] = [];
  function visit(node: Root | Element) {
    for (const child of node.children) {
      if (child.type !== "element") continue;
      if (/^h[1-6]$/.test(child.tagName)) headings.push(child);
      visit(child);
    }
  }
  visit(tree);
  return headings;
}

// Embed a complete document beneath the page title. Documents already starting
// at H2 need no offset; otherwise shift every level, not just their H1s.
export function embedHeadings(
  tree: Root,
  { preservePreamble = false }: { preservePreamble?: boolean } = {},
): Element[] {
  const headings = headingElements(tree);
  const firstH1 = headings.findIndex((heading) => heading.tagName === "h1");
  if (firstH1 === -1) return [];
  const embedded = preservePreamble ? headings.slice(firstH1) : headings;
  for (const heading of embedded) {
    const original = heading.tagName;
    const level = Number(original[1]) + 1;
    heading.tagName = `h${Math.min(level, 6)}`;
    heading.properties.dataOriginalHeading = original;
    // Native headings stop at H6; retain deeper semantics for assistive tech.
    if (level > 6) heading.properties.ariaLevel = level;
  }
  return embedded;
}
