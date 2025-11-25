import type { MDXComponents } from "mdx/types";
import Link from "next/link";

import { Callout } from "@/components/mdx/callout";
import { Code } from "@/components/mdx/code";

export function MDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="my-4 text-4xl font-bold">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="my-4 text-3xl font-bold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="my-4 text-2xl font-bold">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="my-4 text-xl font-bold">{children}</h4>
    ),
    h5: ({ children }) => (
      <h5 className="my-4 text-lg font-bold">{children}</h5>
    ),
    h6: ({ children }) => (
      <h6 className="my-4 text-base font-bold">{children}</h6>
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
    pre: ({ children }) => <pre>{children}</pre>,
    code: (props) => <Code {...props} />,
  } satisfies MDXComponents;
}
