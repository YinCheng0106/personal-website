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
    slug: "baseball-scoreboard",
    type: "website",
    title: "棒球計分版",
    description: "A customizable baseball scoreboard to display scores, B/S, outs, base runners, and innings.",
    github: "YinCheng0106/baseball-scoreboard",
    language: "TypeScript",
    color: "blue",
    featured: true,
  },
  {
    slug: "cpbl_baseball_web",
    type: "website",
    title: "cpbl_baseball_web",
    description: "A web app for CPBL baseball data.",
    github: "YinCheng0106/cpbl_baseball_web",
    language: "TypeScript",
    color: "blue",
    featured: false,
  }
];
