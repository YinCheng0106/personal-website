import type { MDXComponents } from "mdx/types";
import Link from "next/link";

import { Callout } from "@/components/mdx/callout";
import { Code } from "@/components/mdx/code";
import { CodeBlock } from "@/components/mdx/code-block";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const headingClasses: Record<HeadingTag, string> = {
  h1: "my-4 text-4xl font-bold",
  h2: "my-4 text-3xl font-bold",
  h3: "my-4 text-2xl font-bold",
  h4: "my-4 text-xl font-bold",
  h5: "my-4 text-lg font-bold",
  h6: "my-4 text-base font-bold",
};

function Heading({
  as: Tag,
  className,
  id,
  children,
  anchor = true,
  "data-original-heading": original,
  "aria-level": ariaLevel,
}: {
  as: HeadingTag;
  className: string;
  id?: string;
  children?: React.ReactNode;
  anchor?: boolean;
  "data-original-heading"?: HeadingTag;
  "aria-level"?: number;
}) {
  return (
    <Tag
      id={id}
      aria-level={ariaLevel}
      className={`group ${original ? headingClasses[original] : className}`}
    >
      {children}
      {(original ? Number(original[1]) <= 4 : anchor) && id ? (
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

export function MDXComponents(): MDXComponents {
  return {
    h1: ({ id, children, ...props }) => (
      <Heading as="h1" id={id} className={headingClasses.h1} {...props}>
        {children}
      </Heading>
    ),
    h2: ({ id, children, ...props }) => (
      <Heading as="h2" id={id} className={headingClasses.h2} {...props}>
        {children}
      </Heading>
    ),
    h3: ({ id, children, ...props }) => (
      <Heading as="h3" id={id} className={headingClasses.h3} {...props}>
        {children}
      </Heading>
    ),
    h4: ({ id, children, ...props }) => (
      <Heading as="h4" id={id} className={headingClasses.h4} {...props}>
        {children}
      </Heading>
    ),
    h5: ({ id, children, ...props }) => (
      <Heading
        as="h5"
        id={id}
        anchor={false}
        className="my-4 text-lg font-bold"
        {...props}
      >
        {children}
      </Heading>
    ),
    h6: ({ id, children, ...props }) => (
      <Heading
        as="h6"
        id={id}
        anchor={false}
        className="my-4 text-base font-bold"
        {...props}
      >
        {children}
      </Heading>
    ),
    p: ({ children, id, ...props }) => (
      <p
        id={id}
        className={
          "data-article-title" in props
            ? "group my-4 text-4xl font-bold"
            : "my-2 leading-7"
        }
      >
        {children}
      </p>
    ),
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
