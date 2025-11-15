"use client";

import { notoSerifTC } from "@/app/fonts";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="space-y-3 text-center">
      <h2 className={`${notoSerifTC.className} text-3xl font-bold sm:text-4xl`}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground mx-auto max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}
