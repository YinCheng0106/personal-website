import type { MDXComponents } from "mdx/types";
import Link from "next/link";

import { Callout } from "@/components/mdx/callout";
import { Code } from "@/components/mdx/code";
import { CodeBlock } from "@/components/mdx/code-block";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

function Heading({
  as: Tag,
  className,
  id,
  children,
  anchor = true,
}: {
  as: HeadingTag;
  className: string;
  id?: string;
  children?: React.ReactNode;
  anchor?: boolean;
}) {
  return (
    <Tag id={id} className={`group ${className}`}>
      {children}
      {anchor && id ? (
        <a
          href={`#${id}`}
          aria-label="連結到此段落"
          className="text-muted-foreground hover:text-foreground ml-2 no-underline opacity-0 transition-opacity group-hover:opacity-100"
        >
          #
        </a>
      ) : null}
    </Tag>
  );
}

export function MDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ id, children }) => (
      <Heading
        as="h1"
        id={id}
        anchor={false}
        className="my-4 text-4xl font-bold"
      >
        {children}
      </Heading>
    ),
    h2: ({ id, children }) => (
      <Heading as="h2" id={id} className="my-4 text-3xl font-bold">
        {children}
      </Heading>
    ),
    h3: ({ id, children }) => (
      <Heading as="h3" id={id} className="my-4 text-2xl font-bold">
        {children}
      </Heading>
    ),
    h4: ({ id, children }) => (
      <Heading as="h4" id={id} className="my-4 text-xl font-bold">
        {children}
      </Heading>
    ),
    h5: ({ id, children }) => (
      <Heading
        as="h5"
        id={id}
        anchor={false}
        className="my-4 text-lg font-bold"
      >
        {children}
      </Heading>
    ),
    h6: ({ id, children }) => (
      <Heading
        as="h6"
        id={id}
        anchor={false}
        className="my-4 text-base font-bold"
      >
        {children}
      </Heading>
    ),
    p: ({ children }) => <p className="my-2 leading-7">{children}</p>,
    a: ({ href, children }) => (
      <Link
        className="text-primary/50 hover:text-primary transform no-underline transition-colors duration-200"
        href={href as string}
      >
        {children}
      </Link>
    ),
    Callout: (props) => <Callout {...props} />,
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse">{children}</table>
      </div>
    ),
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    code: (props) => <Code {...props} />,
  } satisfies MDXComponents;
}
