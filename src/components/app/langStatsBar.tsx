"use client";
import { cn } from "@/lib/utils";

type LanguageData = Record<string, number>;

interface LanguageStatsBarProps {
  data: LanguageData;
  className?: string;
}

export function LanguageStatsBar({ data, className }: LanguageStatsBarProps) {
  const total = Object.values(data).reduce((acc, bytes) => acc + bytes, 0);

  const languages = Object.entries(data)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: (bytes / total) * 100,
    }))
    .sort((a, b) => b.bytes - a.bytes);

  const languageColors: Record<string, string> = {
    TypeScript: "bg-[#3178c6]",
    JavaScript: "bg-[#f1e05a]",
    CSS: "bg-[#563d7c]",
    HTML: "bg-[#e34c26]",
    Python: "bg-[#3572a5]",
    Java: "bg-[#b07219]",
    Rust: "bg-[#dea584]",
    Go: "bg-[#00add8]",
    Vue: "bg-[#41b883]",
    React: "bg-[#61dafb]",
    Svelte: "bg-[#ff3e00]",
    Tailwind: "bg-[#38bdf8]",
    default: "bg-gray-500",
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="bg-muted flex h-2 w-full overflow-hidden rounded-full">
        {languages.map((lang) => (
          <div
            key={lang.name}
            className={languageColors[lang.name] || languageColors.default}
            style={{ width: `${lang.percentage}%` }}
            title={`${lang.name}: ${lang.percentage.toFixed(1)}%`}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-4 md:gap-1 text-sm">
        {languages.map((lang) => (
          <div key={lang.name} className="flex items-center gap-2">
            <div
              className={cn(
                "h-3 w-3 rounded-full",
                languageColors[lang.name] || languageColors.default,
              )}
            />
            <span className="text-muted-foreground">{lang.name}</span>
            <span className="text-foreground font-medium">
              {lang.percentage.toFixed(1)} %
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
