import { OgFrameProject, getOgImageResponse } from "@/lib/og";

export const alt = "YinCheng 的專案集";

export async function GET() {
  const imageResponse = await getOgImageResponse();
  return imageResponse(
    <OgFrameProject
      url="yincheng.app/projects"
      type="Showcase"
      title="專案"
      description="個人開發、開源協作與實驗作品"
      titleSize={140}
    />,
  );
}
