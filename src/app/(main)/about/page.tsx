import { Metadata } from "next";
import { AboutContent } from "./aboutContent";

export const metadata: Metadata = {
  title: "關於我",
  description: "認識 YinCheng，了解我的技能與聯絡方式",
  openGraph: {
    title: "關於我",
    description: "認識 YinCheng，了解我的技能與聯絡方式",
    url: "https://yincheng.app/about",
    siteName: "YinCheng 關於我",
    locale: "zh_TW",
    type: "website",
    images: [
      {
        url: "https://yincheng.app/about/og",
        width: 1200,
        height: 630,
        alt: "關於 YinCheng",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "關於我",
    description: "認識 YinCheng，了解我的技能與聯絡方式",
    images: ["https://yincheng.app/about/og"],
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
