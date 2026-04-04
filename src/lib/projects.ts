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

export const typeIcon: Record<string, string> = {
  website: "iconoir:web-window",
  bot: "mdi:robot-outline",
  app: "mdi:cellphone-iphone",
  tools: "mdi:tools",
  library: "mdi:library-books",
  package: "mdi:package-variant-closed",
  api: "mdi:api",
};

export const projects: Project[] = [
  {
    slug: "personal-website",
    type: "website",
    title: "Personal Website",
    description: "個人網頁 (本站)",
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
    description: "這是一隻Discord的BOT，不定時會更新，主要功能是檢視天氣、檢視地震(含推播功能)、文字翻譯、查詢中油油價(含推播功能)以及查詢中華職棒相關的功能 ",
    github: "YINLA-TEAM/YINLA",
    language: "JavaScript",
    color: "yellow",
    featured: true,
  },
  {
    slug: "iso-countries-utils",
    type: "package",
    title: "iso-countries-utils",
    description: "一個輕量級、零依賴且型別安全的工具庫，用於轉換 ISO 3166-1 國家代碼（Alpha-2, Alpha-3, Numeric）與國旗 Emoji。專為高效能設計，並內建模糊搜尋與驗證功能",
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
  {
    slug: "personai-api",
    type: "api",
    title: "personai-api",
    description: "AI 智慧健身教練後端服務 — 即時生物力學分析、動作計數與姿勢錯誤偵測",
    github: "YinCheng0106/personai-api",
    language: "Python",
    color: "blue",
    featured: true,
  }
];
