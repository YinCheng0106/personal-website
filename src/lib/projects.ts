export type Project = {
  slug: string;
  title: string;
  logo?: string;
  type: string;
  description: string;
  github: string;
  stars?: number;
  forks?: number;
  language?: string;
  color?: string;
  image?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "personal-website",
    type: "website",
    title: "Personal Website",
    description: "My personal portfolio website built with Next.js and Tailwind CSS.",
    github: "YinCheng0106/personal-website",
    language: "TypeScript",
    color: "blue",
    featured: true,
  },
  {
    slug: "yinla-bot",
    type: "bot",
    title: "YINLA",
    logo: "/projects/yinla-bot/logo.png",
    description: "This is a Discord bot for YINLA Team.",
    github: "YINLA-TEAM/YINLA",
    language: "JavaScript",
    color: "yellow",
    featured: true,
  },
  {
    slug: "iso-countries-utils",
    type: "package",
    title: "iso-countries-utils",
    description: "A lightweight, zero‑dependency, and type‑safe utility library for converting ISO 3166‑1 country codes (Alpha‑2, Alpha‑3, Numeric) and flag emoji. Built for high performance with fuzzy search and validation out of the box.",
    github: "YinCheng0106/iso-countries-utils",
    language: "TypeScript",
    color: "blue",
    featured: true,
  },
  {
    slug: "yinla-bot-website",
    type: "website",
    title: "yinla-bot-website",
    description: "YINLA Discord Bot 的官方網站",
    github: "YINLA-TEAM/yinla-bot-website",
    language: "TypeScript",
    color: "blue",
    featured: true,
  },
];
