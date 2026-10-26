import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import type { ReactElement } from "react";
import type { Root } from "hast";
import { embedHeadings } from "@/lib/embedded-headings";

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

// Match this renderer's `prose` typography using the original heading rank.
// The semantic offset must not change the visual size of README sections.
const headingClasses = {
  h1: "mt-0 mb-[0.888889em] text-[2.25em] leading-[1.11111] font-extrabold",
  h2: "mt-[2em] mb-[1em] text-[1.5em] leading-[1.3333333] font-bold",
  h3: "mt-[1.6em] mb-[0.6em] text-[1.25em] leading-[1.6] font-semibold",
  h4: "mt-[1.5em] mb-[0.5em] text-[1em] leading-[1.5] font-semibold",
  h5: "m-0 text-[1em] leading-[inherit] font-normal",
  h6: "m-0 text-[1em] leading-[inherit] font-normal",
};

function rehypeEmbeddedHeadings() {
  return (tree: Root) => {
    for (const heading of embedHeadings(tree)) {
      const original = heading.properties
        .dataOriginalHeading as keyof typeof headingClasses;
      heading.properties.className = headingClasses[original].split(" ");
    }
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
