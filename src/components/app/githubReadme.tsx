import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import type { ReactElement } from "react";

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
  a: ({ href, children }) =>
    href ? <a href={href}>{children}</a> : <>{children}</>,
  img: ({ src, alt }) =>
    typeof src === "string" && src ? (
      // External README images have unknown dimensions; preserve their intrinsic size.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} className="h-auto max-w-full" />
    ) : null,
};

export function renderGitHubReadme(readme: unknown): ReactElement | null {
  if (!isGitHubReadme(readme)) return null;

  const source = decodeGitHubReadme(readme);
  if (!source) return null;

  return (
    <ReactMarkdown
      skipHtml
      components={components}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
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
