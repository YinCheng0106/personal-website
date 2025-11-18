"use client";

import { Icon } from "@iconify-icon/react";
import { Badge } from "@/components/ui/badge";

interface Props {
  lang: string;
  type: "color" | "icon";
}

export function CodeBadge({ lang, type }: Props) {
  const langColors: Record<string, string> = {
    JavaScript: "bg-yellow-400",
    TypeScript: "bg-blue-500",
    Python: "bg-green-500",
    Ruby: "bg-red-500",
    Go: "bg-cyan-500",
    Rust: "bg-orange-600",
    Java: "bg-red-600",
    CSharp: "bg-purple-600",
    PHP: "bg-indigo-600",
    HTML: "bg-orange-400",
    CSS: "bg-blue-400",
    Shell: "bg-gray-600",
  };

  const langIcons: Record<string, string> = {
    JavaScript: "logos:javascript",
    TypeScript: "logos:typescript-icon",
    Python: "logos:python",
    Ruby: "logos:ruby",
    Go: "logos:go",
    Rust: "logos:rust",
    Java: "logos:java",
    CSharp: "logos:c-sharp",
    PHP: "logos:php",
    HTML: "logos:html-5",
    CSS: "logos:css-3",
    Shell: "logos:gnu-bash",
  };

  if (type === "color") {
    const colorClass = langColors[lang] || "bg-gray-500";
    return (
      <Badge variant="outline" className="text-xs">
        <div className={`h-2 w-2 rounded-full ${colorClass} mr-1`} />
        {lang}
      </Badge>
    );
  } else if (type === "icon") {
    const iconName = langIcons[lang] || "mdi:code-tags";
    return (
      <Badge variant="outline" className="text-xs">
        <Icon className="mr-1" icon={iconName} />
        {lang}
      </Badge>
    )
  } else {
    return null;
  }
}
