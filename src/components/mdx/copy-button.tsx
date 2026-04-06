"use client";

import { useState } from "react";
import { Icon } from "@iconify-icon/react";

export function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="bg-background/80 hover:bg-accent absolute top-2 right-2 flex size-8 items-center justify-center rounded-md border opacity-0 backdrop-blur transition-all group-hover:opacity-100"
      aria-label="複製程式碼"
    >
      <Icon
        icon={copied ? "lucide:check" : "lucide:copy"}
        width={16}
        height={16}
        className={`transition-all duration-200 ${copied ? "scale-110 text-green-500" : ""}`}
      />
    </button>
  );
}
