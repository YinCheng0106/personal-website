"use client";

import { notoSerifTC } from "@/app/fonts";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  as?: "h1" | "h2";
}

export function SectionTitle({
  title,
  subtitle,
  as: Heading = "h2",
}: SectionTitleProps) {
  return (
    <div className="space-y-3 text-center mb-8">
      <Heading className={`${notoSerifTC.className} text-3xl font-bold sm:text-4xl`}>
        {title}
      </Heading>
      {subtitle && (
        <p className="text-muted-foreground mx-auto max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}
