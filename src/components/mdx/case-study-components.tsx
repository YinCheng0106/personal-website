import type { MDXComponents } from "mdx/types";

/** Minimal, server-rendered article typography; independent of blog behavior. */
export const caseStudyComponents: MDXComponents = {
  a: ({ children, ...props }) => (
    <a {...props} className="link break-words underline underline-offset-4">
      {children}
    </a>
  ),
  table: ({ children, ...props }) => (
    <div
      role="region"
      aria-label="文章表格，可水平捲動"
      tabIndex={0}
      className="focus-visible:outline-ring my-6 overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <table {...props} className="my-0 min-w-80">
        {children}
      </table>
    </div>
  ),
  th: (props) => <th {...props} scope="col" />,
};
