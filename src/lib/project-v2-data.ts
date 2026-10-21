import { validateProjectV2s, type ProjectV2 } from "@/lib/project-v2";

/** Public portfolio content. Legacy route slugs remain stable through Phase 2-B2. */
export const projectV2s: readonly ProjectV2[] = [
  {
    id: "dpip",
    slug: "dpip",
    title: "DPIP",
    summary:
      "ExpTechTW 團隊開發的臺灣防災資訊 App，整合地震、天氣與災害示警；我參與 iOS 天氣小工具的實作與整合。",
    presentation: {
      type: "app",
      language: "Dart",
      color: "blue",
      featured: true,
    },
    lifecycle: "active",
    publicationStatus: "published",
    attribution: {
      kind: "team",
      name: "ExpTechTW",
      role: "Contributor — iOS weather widgets",
    },
    repositories: [
      { provider: "github", repository: "ExpTechTW/DPIP", isPrimary: true },
    ],
    contributionEvidence: [
      {
        label: "iOS 天氣小工具基礎（PR #576）",
        href: "https://github.com/ExpTechTW/DPIP/pull/576",
      },
      {
        label: "小工具地點設定（PR #579）",
        href: "https://github.com/ExpTechTW/DPIP/pull/579",
      },
      {
        label: "小工具背景天氣更新（PR #580）",
        href: "https://github.com/ExpTechTW/DPIP/pull/580",
      },
      {
        label: "中型與大型天氣小工具（PR #582）",
        href: "https://github.com/ExpTechTW/DPIP/pull/582",
      },
      {
        label: "預報到期處理（PR #607）",
        href: "https://github.com/ExpTechTW/DPIP/pull/607",
      },
      {
        label: "依小工具地點開啟 App（PR #608）",
        href: "https://github.com/ExpTechTW/DPIP/pull/608",
      },
      {
        label: "互動式預報重新整理（PR #629）",
        href: "https://github.com/ExpTechTW/DPIP/pull/629",
      },
    ],
  },
  {
    id: "personal-website",
    slug: "personal-website",
    title: "Personal Website",
    summary: "個人網頁 (本站)",
    presentation: {
      type: "website",
      language: "TypeScript",
      color: "blue",
      featured: false,
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
      "YINLA-TEAM 的 Discord 資訊服務，透過 Bot 提供臺灣天氣、地震、交通與棒球資訊，並有獨立產品網站；公開 README 記載 YinCheng 為 Bot 建立與維護者。",
    presentation: {
      type: "bot",
      language: "JavaScript",
      color: "yellow",
      featured: true,
    },
    lifecycle: "unknown",
    publicationStatus: "published",
    attribution: {
      kind: "team",
      name: "YINLA-TEAM",
      role: "Bot creator and maintainer (per public README)",
    },
    repositories: [
      { provider: "github", repository: "YINLA-TEAM/YINLA", isPrimary: true },
      { provider: "github", repository: "YINLA-TEAM/yinla-bot-website" },
    ],
    media: { logo: "/projects/yinla-bot/logo.png" },
    contributionEvidence: [
      {
        label: "YINLA Bot README 致謝",
        href: "https://github.com/YINLA-TEAM/YINLA/blob/main/README.md#credits",
      },
    ],
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
      featured: false,
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
      featured: false,
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
    title: "PersonAI",
    summary:
      "大學畢業專題學生團隊共同開發的 AI 健身教練，結合 Next.js 網頁前端與 FastAPI 後端，提供姿勢分析、動作計數與運動紀錄。",
    presentation: {
      type: "website",
      language: "TypeScript",
      color: "blue",
      featured: true,
    },
    lifecycle: "unknown",
    publicationStatus: "published",
    attribution: { kind: "team", name: "大學畢業專題學生團隊" },
    repositories: [
      {
        provider: "github",
        repository: "YinCheng0106/personai-web",
        isPrimary: true,
      },
      {
        provider: "github",
        repository: "YinCheng0106/personai-api",
      },
    ],
  },
  {
    id: "quotamew",
    slug: "quotamew",
    title: "QuotaMew",
    summary:
      "原生 macOS 選單列 App，顯示 AI 程式開發工具的額度與重設時間；目前公開文件確認支援 Codex，Claude Code 整合仍屬實驗性、未驗證。",
    presentation: {
      type: "app",
      language: "Swift",
      color: "blue",
      featured: true,
    },
    lifecycle: "unknown",
    publicationStatus: "published",
    attribution: { kind: "individual", name: "YinCheng" },
    repositories: [
      {
        provider: "github",
        repository: "YinCheng0106/QuotaMew",
        isPrimary: true,
      },
      { provider: "github", repository: "YinCheng0106/QuotaMew-docs" },
    ],
  },
];

validateProjectV2s(projectV2s);
