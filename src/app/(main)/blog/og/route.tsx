import { OgFrameBlog, getOgImageResponse } from "@/lib/og";

export const alt = "YinCheng 的部落格";

export async function GET() {
  const imageResponse = await getOgImageResponse();
  return imageResponse(
    <OgFrameBlog
      url="yincheng.app/blog"
      title="部落格"
      description="技術筆記、學習紀錄與生活雜談"
      titleSize={140}
    />,
  );
}
