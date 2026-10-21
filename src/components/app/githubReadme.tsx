import Image from "next/image";
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
      <Image src={src} alt={alt ?? ""} width={1200} height={800} unoptimized />
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
