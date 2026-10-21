import { validateProjectV2s, type ProjectV2 } from "@/lib/project-v2";

/** Existing public projects. Keep route slugs and the primary GitHub repositories stable. */
export const projectV2s: readonly ProjectV2[] = [
  {
    id: "personal-website",
    slug: "personal-website",
    title: "Personal Website",
    summary: "個人網頁 (本站)",
    presentation: {
      type: "website",
      language: "TypeScript",
      color: "blue",
      featured: true,
    },
    lifecycle: "unknown",
    publicationStatus: "published",
    repositories: [
      {
        provider: "github",
        repository: "YinCheng0106/personal-website",
        isPrimary: true,
      },
    ],
  },
  {
    id: "yinla-bot",
    slug: "yinla-bot",
    title: "YINLA",
    summary:
      "這是一隻Discord的BOT，不定時會更新，主要功能是檢視天氣、檢視地震(含推播功能)、文字翻譯、查詢中油油價(含推播功能)以及查詢中華職棒相關的功能 ",
    presentation: {
      type: "bot",
      language: "JavaScript",
      color: "yellow",
      featured: true,
    },
    lifecycle: "unknown",
    publicationStatus: "published",
    repositories: [
      { provider: "github", repository: "YINLA-TEAM/YINLA", isPrimary: true },
    ],
    media: { logo: "/projects/yinla-bot/logo.png" },
  },
  {
    id: "iso-countries-utils",
    slug: "iso-countries-utils",
    title: "iso-countries-utils",
    summary:
      "一個輕量級、零依賴且型別安全的工具庫，用於轉換 ISO 3166-1 國家代碼（Alpha-2, Alpha-3, Numeric）與國旗 Emoji。專為高效能設計，並內建模糊搜尋與驗證功能",
    presentation: {
      type: "package",
      language: "TypeScript",
      color: "blue",
      featured: true,
    },
    lifecycle: "unknown",
    publicationStatus: "published",
    repositories: [
      {
        provider: "github",
        repository: "YinCheng0106/iso-countries-utils",
        isPrimary: true,
      },
    ],
  },
  {
    id: "yinla-bot-website",
    slug: "yinla-bot-website",
    title: "yinla-bot-website",
    summary: "YINLA Discord Bot 的官方網站",
    presentation: {
      type: "website",
      language: "TypeScript",
      color: "blue",
      featured: true,
    },
    lifecycle: "unknown",
    publicationStatus: "published",
    repositories: [
      {
        provider: "github",
        repository: "YINLA-TEAM/yinla-bot-website",
        isPrimary: true,
      },
    ],
  },
  {
    id: "personai-api",
    slug: "personai-api",
    title: "personai-api",
    summary:
      "AI 智慧健身教練後端服務 — 即時生物力學分析、動作計數與姿勢錯誤偵測",
    presentation: {
      type: "api",
      language: "Python",
      color: "blue",
      featured: true,
    },
    lifecycle: "unknown",
    publicationStatus: "published",
    repositories: [
      {
        provider: "github",
        repository: "YinCheng0106/personai-api",
        isPrimary: true,
      },
    ],
  },
];

validateProjectV2s(projectV2s);
