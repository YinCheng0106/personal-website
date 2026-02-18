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
  },
  twitter: {
    card: "summary_large_image",
    title: "關於我",
    description: "認識 YinCheng，了解我的技能與聯絡方式",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
