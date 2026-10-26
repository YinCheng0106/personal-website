import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import type { ReactElement } from "react";
import type { Root, Element } from "hast";

import {
  decodeGitHubReadme,
  isGitHubReadme,
  type GitHubReadme,
  createGitHubReadmeUrlTransform,
} from "@/lib/github-readme";
import type { Components } from "react-markdown";

type GitHubReadmeViewProps = {
  readme: GitHubReadme | null | undefined;
};

const components: Components = {
  table: ({ children }) => (
    <div
      role="region"
      aria-label="README 表格，可水平捲動"
      tabIndex={0}
      className="max-w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <table>{children}</table>
    </div>
  ),
  a: ({ href, children }) =>
    href ? <a href={href}>{children}</a> : <>{children}</>,
  img: ({ src, alt }) =>
    typeof src === "string" && src ? (
      // External README images have unknown dimensions; preserve their intrinsic size.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} className="h-auto max-w-full" />
    ) : null,
};

// The project title owns the page H1. Transform the Markdown tree before
// rendering, retaining the original title typography and rehype-slug anchors.
function rehypeEmbeddedHeadings() {
  return (tree: Root) => {
    function visit(node: Root | Element) {
      for (const child of node.children) {
        if (child.type !== "element") continue;
        if (child.tagName === "h1") {
          child.tagName = "h2";
          child.properties.className = [
            "mt-0",
            "mb-[0.888889em]",
            "text-[2.25em]",
            "leading-[1.11111]",
            "font-extrabold",
          ];
        }
        visit(child);
      }
    }
    visit(tree);
  };
}

export function renderGitHubReadme(readme: unknown): ReactElement | null {
  if (!isGitHubReadme(readme)) return null;

  const source = decodeGitHubReadme(readme);
  if (!source) return null;

  return (
    <ReactMarkdown
      skipHtml
      components={components}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, rehypeEmbeddedHeadings]}
      urlTransform={createGitHubReadmeUrlTransform({
        htmlUrl: readme.html_url,
        downloadUrl: readme.download_url,
        path: readme.path,
      })}
    >
      {source}
    </ReactMarkdown>
  );
}

export default function GitHubReadmeView({
  readme,
}: GitHubReadmeViewProps) {
  const content = renderGitHubReadme(readme);
  if (content === null) {
    return <p className="text-muted-foreground">無 README 資料</p>;
  }

  return <>{content}</>;
}
