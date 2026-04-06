"use client";

import { useRef } from "react";
import { CopyButton } from "./copy-button";

export function CodeBlock({ children }: { children: React.ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);

  return (
    <div className="group relative">
      <pre
        ref={preRef}
        className="overflow-x-auto rounded-lg border bg-[#f6f8fa] p-4 dark:bg-[#161b22]"
      >
        {children}
      </pre>
      <CopyButton getText={() => preRef.current?.textContent ?? ""} />
    </div>
  );
}
