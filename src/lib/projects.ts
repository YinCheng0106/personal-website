export type Project = {
  slug: string;
  title: string;
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
    title: "Personal Website",
    description: "",
    github: "YinCheng0106/personal-website",
    language: "TypeScript",
    stars: 10,
    forks: 2,
    color: "blue",
    featured: true,
  },
  {
    slug: "yinla-bot",
    title: "YINLA",
    description: "This is a Discord bot for YINLA Team.",
    github: "YINLA-TEAM/YINLA",
    language: "JavaScript",
    color: "yellow",
    featured: true,
  },
  {
    slug: "baseball-scoreboard",
    title: "棒球計分版",
    description: "A customizable baseball scoreboard to display scores, B/S, outs, base runners, and innings.",
    github: "YinCheng0106/baseball-scoreboard",
    language: "TypeScript",
    color: "blue",
    featured: true,
  },
  {
    slug: "cpbl_baseball_web",
    title: "cpbl_baseball_web",
    description: "A web app for CPBL baseball data.",
    github: "YinCheng0106/cpbl_baseball_web",
    language: "TypeScript",
    color: "blue",
    featured: false,
  }
];
